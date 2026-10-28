# Snack Bar

A tab for the hub's community Snack Bar. Each snack (SKU) has an NFC sticker
that encodes `https://batchmate.app/snack/<skuId>`. Tapping it adds the snack
to the tapper's tab; admins settle up with people by hand and record payments.
It is not a payment system. Internally the data is a ledger
(`snack_ledger_entry`), but user-facing copy always says "Snack Bar".

## Rules

- Balance = sum of `amount_cents` over non-voided entries. Purchases are
  positive, payments negative. Entries are voided, never deleted.
- SKU name and price are snapshotted onto each entry, so editing a SKU never
  rewrites history.
- A user can void their own purchase while it is < 24h old **and** no
  payment has been recorded after it. Admins can void anything.
- Admins are RC person IDs listed in `packages/api/src/snack-bar-admins.ts`.

## The tap flow

The same on Android, iOS and web:

1. A tag opens `/snack/<skuId>` (in the app if installed, otherwise the web).
2. Before anything else, even the login check, the client redirects to
   `/snack/<skuId>?k=<key>` with a fresh random key (`newSnackLinkKey`).
   Logged-out users go through login and come back to that keyed URL.
3. The client calls the purchase endpoint with the key. The first request
   with a key records the purchase; any later request with it (reload,
   history, back button) returns that same purchase, even if it was undone
   or the snack has since been archived. A key used by someone else is a 409.
4. Everyone lands on the same summary (`SnackPurchaseSummary` in
   `@batchmate/ui`): what, when, how much, current balance, and **Undo**.
   The app stays open on it.

How the tag reaches the app:

- **Android:** verified app links for `https://batchmate.app/snack/*`
  (needs `assetlinks.json`, below). Samsung's NFC stack hands URL tags to the
  default browser as a plain VIEW intent, so the `NDEF_DISCOVERED` filter in
  `apps/mobile/plugins/with-snack-bar-nfc.js` isn't enough on its own. On a
  dev phone, approve the domain manually instead:
  `adb shell pm set-app-links-user-selection --user 0 --package app.batchmate.app true batchmate.app`
- **iOS:** background tag reading opens the universal link after the user
  taps the system banner (needs `apple-app-site-association`).

Tags written from a dev build still point at batchmate.app; the SKU ID is what
matters, so dev-written tags only resolve against the DB they were created in.

## Before shipping

- Add admin RC IDs to `snack-bar-admins.ts`.
- Native modules were added (NFC, sharing, file-system), so this needs a
  store build, not an EAS update. Bump `version` in `app.json`.
- Serve `/.well-known/assetlinks.json` (Play App Signing SHA-256 only, never
  the public React Native debug key) and
  `/.well-known/apple-app-site-association`. Without these, taps open the
  web page instead of the app.
- Enable NFC Tag Reading + Associated Domains on the iOS App ID.

## Local development

### Backend + web

```sh
pnpm install --ignore-scripts   # better-sqlite3 has no prebuilt for Node 26; it's only used by the auth-schema CLI
node node_modules/.pnpm/workerd@*/node_modules/workerd/install.js   # workerd's postinstall, skipped above
cp .dev.vars.example .dev.vars  # fill in BETTER_AUTH_SECRET + RC OAuth creds
pnpm db:migrate
cd apps/api && pnpm exec wrangler dev --local   # --local: no Cloudflare login; door buttons won't work
cd apps/web && pnpm dev
```

(Node 22 per the README avoids the `--ignore-scripts` dance.)

Keep `SKIP_ACCESS_CONTROL_PROVISIONING="true"` in `.dev.vars` so first login
doesn't create real door-system users. The RC OAuth app must allow the
callback `http://localhost:8787/api/v1/auth/oauth2/callback/recurse`.

To make yourself an admin locally, add your RC ID to `snack-bar-admins.ts`
(don't commit test IDs).

### Android device

Expo Go can't do NFC, so build a dev client:

1. `JAVA_HOME` → a JDK 17+ (Android Studio's `jbr` works); `ANDROID_HOME` →
   `%LOCALAPPDATA%\Android\Sdk`.
2. Windows: `git config --global core.longpaths true` and enable
   `LongPathsEnabled` in the registry.
3. Enable USB debugging; uninstall the Play Store build (different signing key).
4. `adb reverse tcp:8081 tcp:8081 && adb reverse tcp:8787 tcp:8787` so the
   phone's `localhost` is your machine (OAuth callback + API).
5. Windows: install CMake 3.31.x from the SDK manager and build with
   `CMAKE_VERSION=3.31.6` set. The default CMake 3.22.1 bundles a ninja that
   can't handle pnpm's long paths ("build.ninja still dirty after 100
   tries"); react-native-worklets only switches versions via that env var.
6. `pnpm --filter @batchmate/mobile android:device`, then
   `pnpm --filter @batchmate/mobile start --localhost`.

Use NTAG213/215 stickers. Admin → Snacks & tags writes and identifies tags.
