import { sql } from "drizzle-orm"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { user } from "./auth-schema"
import { typeIdColumn, typeIdPrimaryKey } from "./typeid"

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

export const snackSku = sqliteTable("snack_sku", {
	id: typeIdPrimaryKey("sku")("id"),
	name: text("name").notNull(),
	priceCents: integer("price_cents").notNull(),
	archivedAt: integer("archived_at", { mode: "timestamp_ms" }),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull(),
})

// The Snack Bar ledger. Append-only: entries are voided, never deleted.
// amountCents is positive for what the user owes (purchases) and negative
// for what they've paid back, so a balance is SUM(amount_cents) over
// non-voided rows.
export const snackLedgerEntry = sqliteTable(
	"snack_ledger_entry",
	{
		id: typeIdPrimaryKey("sle")("id"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		kind: text("kind", { enum: ["purchase", "payment"] }).notNull(),
		skuId: typeIdColumn("sku")("sku_id").references(() => snackSku.id),
		// Snapshot of the SKU name at purchase time; prices live in amountCents.
		skuName: text("sku_name"),
		// Purchases only ("Buy another" bumps it). amountCents is always
		// quantity × the unit price at purchase time.
		quantity: integer("quantity").notNull().default(1),
		amountCents: integer("amount_cents").notNull(),
		source: text("source", { enum: ["nfc", "web", "admin"] }).notNull(),
		note: text("note"),
		// Payments only: who the money was handed or sent to.
		paymentRecipient: text("payment_recipient"),
		// Client-generated so a retried tap never records a second purchase.
		idempotencyKey: text("idempotency_key").unique(),
		recordedBy: text("recorded_by").references(() => user.id),
		voidedAt: integer("voided_at", { mode: "timestamp_ms" }),
		voidedBy: text("voided_by").references(() => user.id),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("snack_ledger_entry_user_id_idx").on(table.userId, table.createdAt),
		index("snack_ledger_entry_created_at_idx").on(table.createdAt),
	],
)
