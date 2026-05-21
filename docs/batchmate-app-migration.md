# batchmate.app migration

We're moving the production hostname from `recurse.rocks` to `batchmate.app`.
Phase 1 is shipped: the worker serves both hosts, browser traffic on
recurse.rocks is 302'd to batchmate.app, and `/api/v1/*` keeps answering on
recurse.rocks so old mobile installs keep working. This file tracks the
phases that still need to happen.

> **Always use 302, never 301.** We plan to reuse `recurse.rocks` for a
> different product later. A 301 is cached by browsers indefinitely and
> would block re-purposing the hostname. Every redirect in this plan is
> a temporary (`302`) redirect for that reason.

## Status

- [x] **Phase 0** — domain registered, DNS pointed at Cloudflare, batchmate.app custom hostname added to the worker, new RC OAuth app created with the batchmate.app callback (`https://batchmate.app/api/v1/auth/oauth2/callback/recurse`).
- [x] **Phase 1** — dual-host serve. Worker answers on both hosts, host-aware OAuth credential selection, browser redirect from recurse.rocks → batchmate.app.
- [ ] **Phase 2** — ship a new mobile build pointing at batchmate.app; instrument legacy traffic.
- [ ] **Phase 3** — stop using recurse.rocks for batchmate. The domain itself stays registered for a future product; we just unbind it from this worker.

## Phase 2 — ship the new mobile build, instrument legacy traffic

Goal: get the user base off the recurse.rocks API surface so Phase 3 is safe.

### 2.1 Ship a new mobile release

`PROD_API_URL` in `packages/api-client/src/index.ts` is already
`https://batchmate.app`, so any mobile build cut from `main` after Phase 1
will hit the new host.

Tasks:

- Bump `version` and `ios.buildNumber` / `android.versionCode` in
  `apps/mobile/app.json`.
- Submit to TestFlight and Play internal track, validate that:
  - Fresh OAuth login completes against batchmate.app (cookie set on
    batchmate.app, session row created with the new app's tokens).
  - A device upgraded from the previous build is logged out the first
    time its access token expires (expected — see "One subtle side
    effect" in the [Phase 1 PR / commit notes](#)); a single re-OAuth
    fixes it.
  - Direct zoom URLs load (validates the `api.zoomRooms` round trip).
- Promote to production after a soak period.

### 2.2 Track legacy API traffic

Goal: know when we can safely turn off recurse.rocks.

Add a `User-Agent` (or a custom `X-Batchmate-Client`) header from the
mobile build that includes the app version, then log the host + version
tuple on each request. Two viable places:

1. Worker-side logging — add a single line in the `/api/v1/*` middleware
   in `apps/api/src/index.ts` to emit `{host, ua}` to `console.log`,
   which CF Workers will surface in `pnpm tail`. Cheap, no infra.
2. Cloudflare Analytics Engine if you want to chart it over time — adds
   an `[[analytics_engine_datasets]]` binding and one `writeDataPoint`
   call per request. More work, more durable.

Either way, the question we want to answer weekly is: *what fraction of
`/api/v1/*` traffic still hits `recurse.rocks`?*

### 2.3 (Optional) Force-update banner for the old mobile build

Only worth doing if Phase 3 is blocked on a long tail of stuck installs.
Options:

- Ship a remote-config endpoint that returns `{minSupportedVersion}` and
  show a "please update" sheet if the client is below it.
- Hard cut: change a server response to a sentinel error on old versions
  so the app shows an update prompt. More user-hostile.

Skip this section if natural store auto-updates get legacy traffic below
the threshold below.

### Exit criteria

Move to Phase 3 when both are true:

- `/api/v1/*` traffic to `recurse.rocks` is **< 1%** of total `/api/v1/*`
  traffic over a rolling 7 days.
- The mobile release with `PROD_API_URL = https://batchmate.app` has been
  in production for at least 2 weeks (so most active users have
  auto-updated).

## Phase 3 — unbind recurse.rocks from this worker

Goal: batchmate.app is the only host this worker serves, and the
codebase has no leftover special-casing for recurse.rocks. The
`recurse.rocks` domain itself stays registered and the zone stays on
Cloudflare — we'll repurpose it for a different product later. Nothing
in this phase promotes the redirect to `301` or surrenders the
registration.

### 3.1 Drop the `/api/v1/*` carve-out (still 302)

In `apps/api/src/index.ts`, remove the `/api/v1/*` exception so every
request to recurse.rocks gets redirected, including legacy mobile API
calls. Keep the status at `302`:

```ts
app.use(async (c, next) => {
  const url = new URL(c.req.url)
  if (url.hostname === "recurse.rocks") {
    url.hostname = "batchmate.app"
    return c.redirect(url.toString(), 302)
  }
  await next()
})
```

This is the user-visible cutover for old mobile installs: their API
requests start 302-ing to batchmate.app, which they'll either follow
(losing the recurse.rocks-scoped session cookie and showing as logged
out) or fail on, depending on the client. Either way, the one-tap
re-OAuth on batchmate.app fixes it. Expect a small support bump.

Do not change `302` → `301` here or anywhere else. A 301 is
permanently cached by browsers and would prevent recurse.rocks from
ever serving anything else in the future.

### 3.2 Unbind recurse.rocks from the worker

In `wrangler.toml`, delete the recurse.rocks `[[routes]]` block:

```toml
# delete this:
[[routes]]
pattern = "recurse.rocks"
custom_domain = true
```

After `pnpm ship`, requests to recurse.rocks no longer reach this
worker. The 302 middleware from 3.1 becomes dead code on this worker
(it can only fire when the worker actually answers recurse.rocks).
Recommended: leave the middleware in place for one release as a
belt-and-suspenders safeguard, then delete it.

What happens to recurse.rocks itself: the zone stays on Cloudflare with
no worker bound. Cloudflare returns a generic 1014/SSL error for any
direct hits until you point it at something new. That's fine — by this
point traffic should be near zero, and the next product on
recurse.rocks will repoint it. **Do not let the domain registration
lapse and do not delete the zone.**

### 3.3 Remove the legacy OAuth credentials and host-aware selection

After Phase 3.2 is live, no request will ever land on a recurse.rocks
code path inside this worker, so the legacy OAuth app is dead weight
here. (The legacy OAuth app itself can stay around if you want — it's
inert until something requests its callback URL — but for hygiene,
delete it.)

- Delete the legacy OAuth secrets from the Cloudflare worker:
  ```
  pnpm wrangler secret delete RC_CLIENT_ID
  pnpm wrangler secret delete RC_CLIENT_SECRET
  ```
- Rename `RC_BATCHMATE_CLIENT_ID` → `RC_CLIENT_ID` (and the secret
  counterpart) so the codebase loses the "batchmate" qualifier:
  ```
  pnpm wrangler secret put RC_CLIENT_ID   # paste the batchmate.app app's id
  pnpm wrangler secret put RC_CLIENT_SECRET
  pnpm wrangler secret delete RC_BATCHMATE_CLIENT_ID
  pnpm wrangler secret delete RC_BATCHMATE_CLIENT_SECRET
  ```
- In `apps/api/src/index.ts`: delete `RC_BATCHMATE_CLIENT_ID` /
  `RC_BATCHMATE_CLIENT_SECRET` from the `Env` bindings and remove the
  `rcOAuthCredsForHost` helper. The middleware pulls `RC_CLIENT_ID` /
  `RC_CLIENT_SECRET` directly again.
- In `packages/auth/src/index.ts`: drop `http://recurse.rocks` and
  `https://recurse.rocks` from `trustedOrigins`. The default `baseURL`
  is already `https://batchmate.app`.
- In `.dev.vars.example`: remove the batchmate-specific block; reword
  the remaining `RC_CLIENT_ID` / `RC_CLIENT_SECRET` comments to drop
  the "recurse.rocks (and localhost)" language.
- In the RC OAuth dashboard: delete the legacy OAuth app (optional but
  tidy).
- Remove the legacy-domain banner: delete
  `apps/web/src/components/legacy-domain-banner.tsx` and its import +
  `<LegacyDomainBanner />` usage in `apps/web/src/routes/__root.tsx`.
  After Phase 3.2 nothing redirects to batchmate.app with the
  `?from=recurse.rocks` marker, so the component can never trigger
  again. Also remove the `url.searchParams.set("from", ...)` call from
  the 302 middleware (or remove the whole middleware, per the note in
  Phase 3.2).

### 3.4 Bookkeeping

- Search the codebase for any remaining `recurse.rocks` references
  (CI configs, READMEs, marketing copy) and remove them. Expected
  hits after 3.3 cleanup: none.
- Leave the recurse.rocks zone on Cloudflare and the domain registered.
  Nothing more to do here until the next product picks it up.

## Risks and rollback

- **If Phase 3.1 (full redirect) breaks anything**, the rollback is a
  one-line revert of the middleware change and a redeploy. Restoring
  the `/api/v1/*` carve-out brings legacy clients back online instantly.
  No 301 is ever issued, so there's nothing cached in browsers to
  unwind.
- **If you delete legacy OAuth creds (Phase 3.3) too early**, any
  request that still lands on recurse.rocks will fail at auth setup
  with a missing-env error. Mitigation: do Phase 3.2 (route removal)
  before Phase 3.3, so no request can reach a recurse.rocks codepath
  in the worker.
- **DNS cache TTL** means even after Phase 3.2 some clients may try
  recurse.rocks for hours/days. They'll get a Cloudflare error page.
  Acceptable given Phase 2 already drove legacy traffic to near zero.
