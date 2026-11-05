import type { TypeId } from "@batchmate/db"
import { snackLedgerEntry, snackSku } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { server } from "../context"
import {
	canUserVoid,
	getBalanceCents,
	getLatestPaymentAt,
	parseIdOrNotFound,
	requireUser,
	selectEntries,
	toEntryDto,
} from "../lib/snack-bar"

// Snack links carry an idempotency key (`/snack/<skuId>?k=<key>`) that the
// client adds before anything else happens. The first request with a key
// records the purchase; every later one (reload, history, back button)
// returns that same purchase, even if it has since been undone or the snack
// archived.
export const snackBarPurchase = server.snackBarPurchase.handler(
	async ({ context, input }) => {
		const sessionUser = requireUser(context)

		const respond = async (id: TypeId<"sle">) => {
			const [row, balanceCents, latestPaymentAt] = await Promise.all([
				selectEntries(context.db).where(eq(snackLedgerEntry.id, id)).get(),
				getBalanceCents(context.db, sessionUser.id),
				getLatestPaymentAt(context.db, sessionUser.id),
			])
			if (!row) {
				throw new ORPCError("INTERNAL_SERVER_ERROR")
			}
			return {
				entry: toEntryDto(row, canUserVoid(row.entry, latestPaymentAt)),
				balanceCents,
			}
		}

		const findByKey = () =>
			context.db
				.select({ id: snackLedgerEntry.id, userId: snackLedgerEntry.userId })
				.from(snackLedgerEntry)
				.where(eq(snackLedgerEntry.idempotencyKey, input.idempotencyKey))
				.get()

		const existing = await findByKey()
		if (existing) {
			if (existing.userId !== sessionUser.id) {
				throw new ORPCError("CONFLICT", {
					message:
						"This Snack Bar link was already used by someone else. Tap the tag again to buy one.",
				})
			}
			return respond(existing.id)
		}

		const skuId = parseIdOrNotFound(input.skuId, "sku")
		const sku = await context.db
			.select()
			.from(snackSku)
			.where(eq(snackSku.id, skuId))
			.get()
		if (!sku) {
			throw new ORPCError("NOT_FOUND", {
				message: "That snack isn't in the Snack Bar.",
			})
		}
		if (sku.archivedAt) {
			throw new ORPCError("BAD_REQUEST", {
				message: `${sku.name} is no longer sold.`,
			})
		}

		// onConflictDoNothing covers two requests racing with the same key.
		const [inserted] = await context.db
			.insert(snackLedgerEntry)
			.values({
				userId: sessionUser.id,
				kind: "purchase",
				skuId: sku.id,
				skuName: sku.name,
				amountCents: sku.priceCents,
				source: input.source,
				idempotencyKey: input.idempotencyKey,
			})
			.onConflictDoNothing({ target: snackLedgerEntry.idempotencyKey })
			.returning({ id: snackLedgerEntry.id })
		if (inserted) {
			return respond(inserted.id)
		}

		const raced = await findByKey()
		if (!raced || raced.userId !== sessionUser.id) {
			throw new ORPCError("CONFLICT")
		}
		return respond(raced.id)
	},
)
