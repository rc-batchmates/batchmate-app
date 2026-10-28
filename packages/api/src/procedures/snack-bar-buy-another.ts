import { snackLedgerEntry, snackSku } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { and, eq, sql } from "drizzle-orm"
import { server } from "../context"
import {
	canUserVoid,
	getBalanceCents,
	getLatestPaymentAt,
	parseIdOrNotFound,
	requireUser,
	selectEntries,
	toEntryDto,
	unitPriceCents,
} from "../lib/snack-bar"

// "Buy another" on the purchase summary: adds one more of the same snack to
// an existing purchase instead of recording a new one. Allowed only while the
// purchase could still be undone, and charged at the price it was bought at.
export const snackBarBuyAnother = server.snackBarBuyAnother.handler(
	async ({ context, input }) => {
		const sessionUser = requireUser(context)
		const id = parseIdOrNotFound(input.id, "sle")

		const entry = await context.db
			.select()
			.from(snackLedgerEntry)
			.where(
				and(
					eq(snackLedgerEntry.id, id),
					eq(snackLedgerEntry.userId, sessionUser.id),
				),
			)
			.get()
		if (!entry) {
			throw new ORPCError("NOT_FOUND")
		}

		const latestPaymentAt = await getLatestPaymentAt(context.db, sessionUser.id)
		if (!canUserVoid(entry, latestPaymentAt)) {
			throw new ORPCError("BAD_REQUEST", {
				message: entry.voidedAt
					? "This purchase was undone. Tap the tag again to buy one."
					: "This purchase can't be changed anymore. Tap the tag again to buy another.",
			})
		}

		if (entry.skuId) {
			const sku = await context.db
				.select({ name: snackSku.name, archivedAt: snackSku.archivedAt })
				.from(snackSku)
				.where(eq(snackSku.id, entry.skuId))
				.get()
			if (sku?.archivedAt) {
				throw new ORPCError("BAD_REQUEST", {
					message: `${sku.name} is no longer sold.`,
				})
			}
		}

		// Only applies if nobody has bumped it since the client looked, so a
		// retried request can't add two.
		const unit = unitPriceCents(entry)
		await context.db
			.update(snackLedgerEntry)
			.set({
				quantity: sql`${snackLedgerEntry.quantity} + 1`,
				amountCents: sql`${snackLedgerEntry.amountCents} + ${unit}`,
			})
			.where(
				and(
					eq(snackLedgerEntry.id, id),
					eq(snackLedgerEntry.quantity, input.expectedQuantity),
					sql`${snackLedgerEntry.voidedAt} is null`,
				),
			)

		const [row, balanceCents] = await Promise.all([
			selectEntries(context.db).where(eq(snackLedgerEntry.id, id)).get(),
			getBalanceCents(context.db, sessionUser.id),
		])
		if (!row) {
			throw new ORPCError("NOT_FOUND")
		}
		return {
			entry: toEntryDto(row, canUserVoid(row.entry, latestPaymentAt)),
			balanceCents,
		}
	},
)
