import { contract, router } from "@batchmate/api"
import { createAuth } from "@batchmate/auth"
import { createDb } from "@batchmate/db"
import { OpenAPIGenerator } from "@orpc/openapi"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { ZodToJsonSchemaConverter } from "@orpc/zod"
import { Hono } from "hono"

type Env = {
	Bindings: {
		ASSETS: Fetcher
		DB: D1Database
		SECURITY_COMPUTER: Fetcher
		BETTER_AUTH_SECRET: string
		// Legacy OAuth app — callback registered for recurse.rocks (+ localhost).
		RC_CLIENT_ID: string
		RC_CLIENT_SECRET: string
		// New OAuth app — callback registered for batchmate.app. Required for
		// any login that lands on batchmate.app. Token refresh for sessions
		// minted there also uses these creds, so do not unset until Phase 3.
		RC_BATCHMATE_CLIENT_ID: string
		RC_BATCHMATE_CLIENT_SECRET: string
		BASE_URL?: string
	}
}

// RC's OAuth dashboard doesn't allow editing redirect URIs on an existing
// app, so the batchmate.app callback lives on a separate OAuth app with
// its own client_id/secret. Pick the matching pair from the request host.
function rcOAuthCredsForHost(
	env: Env["Bindings"],
	hostname: string,
): { clientId: string; clientSecret: string } {
	if (hostname === "batchmate.app") {
		return {
			clientId: env.RC_BATCHMATE_CLIENT_ID,
			clientSecret: env.RC_BATCHMATE_CLIENT_SECRET,
		}
	}
	return { clientId: env.RC_CLIENT_ID, clientSecret: env.RC_CLIENT_SECRET }
}

const app = new Hono<Env>()

// Legacy host redirect. Browser hits to recurse.rocks land on batchmate.app
// for everything except /api/v1/* — old mobile builds still talk to the API
// on recurse.rocks until they update. 302 (not 301) during the dual-host
// phase so we can disable this quickly if needed; promote to 301 in Phase 3.
app.use(async (c, next) => {
	const url = new URL(c.req.url)
	if (
		url.hostname === "recurse.rocks" &&
		!url.pathname.startsWith("/api/v1/")
	) {
		url.hostname = "batchmate.app"
		return c.redirect(url.toString(), 302)
	}
	await next()
})

const handler = new OpenAPIHandler(router)

const generator = new OpenAPIGenerator({
	schemaConverters: [new ZodToJsonSchemaConverter()],
})

app.get("/api/v1/openapi.json", async (c) => {
	const spec = await generator.generate(contract, {
		info: { title: "batchmate API", version: "0.1.0" },
		servers: [{ url: "/api/v1" }],
		security: [{ session: [] }],
		components: {
			securitySchemes: {
				session: {
					type: "apiKey",
					in: "cookie",
					name: "better-auth.session_token",
					description:
						"Session cookie set by Better Auth after OAuth login via Recurse Center",
				},
			},
		},
	})
	return c.json(spec)
})

app.get("/api/v1/docs", (c) => {
	return c.html(`<!doctype html>
<html>
  <head>
    <title>batchmate API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script id="api-reference" data-url="/api/v1/openapi.json"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/scalar-api-reference/1.36.2/standalone.js" integrity="sha512-drc7tqWFFqgmVUQiIjat9KdjXoHosyHoRt//J9p/TmJ2t21skWh6stXK+MBV6snrYWrtZiyTNhdwUl4aI9EtNg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  </body>
</html>`)
})

app.on(["GET", "POST"], "/api/v1/auth/**", async (c) => {
	const db = createDb(c.env.DB)
	const reqUrl = new URL(c.req.url)
	const rcCreds = rcOAuthCredsForHost(c.env, reqUrl.hostname)
	const auth = createAuth(db, {
		...c.env,
		BASE_URL: `${reqUrl.protocol}//${reqUrl.host}`,
		RC_CLIENT_ID: rcCreds.clientId,
		RC_CLIENT_SECRET: rcCreds.clientSecret,
	})
	return auth.handler(c.req.raw)
})

app.use("/api/v1/*", async (c, next) => {
	const db = createDb(c.env.DB)
	const reqUrl = new URL(c.req.url)
	const rcCreds = rcOAuthCredsForHost(c.env, reqUrl.hostname)
	const auth = createAuth(db, {
		...c.env,
		BASE_URL: `${reqUrl.protocol}//${reqUrl.host}`,
		RC_CLIENT_ID: rcCreds.clientId,
		RC_CLIENT_SECRET: rcCreds.clientSecret,
	})

	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	})

	const { matched, response } = await handler.handle(c.req.raw, {
		prefix: "/api/v1",
		context: {
			db,
			securityComputer: c.env.SECURITY_COMPUTER,
			rcOAuth: rcCreds,
			user: session?.user ?? null,
			session: session?.session ?? null,
		},
	})

	if (matched) {
		return response
	}

	await next()
})

app.get("*", async (c) => {
	const response = await c.env.ASSETS.fetch(c.req.raw)
	if (response.ok) return response
	return c.env.ASSETS.fetch(new URL("/", c.req.url))
})

export default app
