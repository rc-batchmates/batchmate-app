import { snackLedgerEntry } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { and, eq } from "drizzle-orm"
import { server } from "../context"
import {
	canUserVoid,
	getBalanceCents,
	getLatestPaymentAt,
	parseIdOrNotFound,
	requireUser,
	toEntryDto,
	voidEntry,
} from "../lib/snack-bar"

export const snackBarVoid = server.snackBarVoid.handler(
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

		// Voiding twice is a no-op so a retried undo still succeeds.
		if (!entry.voidedAt) {
			const latestPaymentAt = await getLatestPaymentAt(
				context.db,
				sessionUser.id,
			)
			if (!canUserVoid(entry, latestPaymentAt)) {
				throw new ORPCError("FORBIDDEN", {
					message:
						"Purchases can only be removed within 24 hours, and not after a payment.",
				})
			}
		}

		const row = await voidEntry(context.db, id, sessionUser.id)
		return {
			entry: toEntryDto(row, false),
			balanceCents: await getBalanceCents(context.db, sessionUser.id),
		}
	},
)
