import { globSync } from "node:fs"
import { defineConfig } from "drizzle-kit"

const d1DbPath = globSync(
	"../../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite",
)[0]

export default defineConfig({
	schema: "./src/schema.ts",
	out: "./drizzle",
	dialect: "sqlite",
	...(d1DbPath && { dbCredentials: { url: d1DbPath } }),
})
