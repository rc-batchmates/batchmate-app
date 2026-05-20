import { sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export * from "./auth-schema"

export const recurseProfile = sqliteTable("recurse_profile", {
	personId: integer("person_id").primaryKey(),
	imageUrl: text("image_url"),
	batch: text("batch"),
	stintType: text("stint_type"),
	cachedAt: integer("cached_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
})
