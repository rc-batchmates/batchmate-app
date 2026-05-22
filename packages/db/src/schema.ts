import { sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export * from "./auth-schema"

export const recurseProfile = sqliteTable("recurse_profile", {
	personId: integer("person_id").primaryKey(),
	imageUrl: text("image_url"),
	batch: text("batch"),
	stintType: text("stint_type"),
	stintInProgress: integer("stint_in_progress", { mode: "boolean" }),
	pronouns: text("pronouns"),
	cachedAt: integer("cached_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
})

export const zoomRoom = sqliteTable("zoom_room", {
	slug: text("slug").primaryKey(),
	label: text("label").notNull(),
	directUrl: text("direct_url").notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
})
