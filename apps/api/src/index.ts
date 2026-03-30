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
		RC_CLIENT_ID: string
		RC_CLIENT_SECRET: string
		BASE_URL?: string
	}
}

const app = new Hono<Env>()

const handler = new OpenAPIHandler(router)

const generator = new OpenAPIGenerator({
	schemaConverters: [new ZodToJsonSchemaConverter()],
})

app.get("/api/v1/openapi.json", async (c) => {
	const spec = await generator.generate(contract, {
		info: { title: "batchmate API", version: "0.1.0" },
		servers: [{ url: "/api/v1" }],
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
	const auth = createAuth(db, c.env)
	return auth.handler(c.req.raw)
})

app.use("/api/v1/*", async (c, next) => {
	const db = createDb(c.env.DB)
	const auth = createAuth(db, c.env)

	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	})

	const { matched, response } = await handler.handle(c.req.raw, {
		prefix: "/api/v1",
		context: {
			db,
			securityComputer: c.env.SECURITY_COMPUTER,
			rcOAuth: {
				clientId: c.env.RC_CLIENT_ID,
				clientSecret: c.env.RC_CLIENT_SECRET,
			},
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
