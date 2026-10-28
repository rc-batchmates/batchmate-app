import { snackLedgerEntry } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { and, eq } from "drizzle-orm"
import { server } from "../context"
import {
	canUserVoid,
	getLatestPaymentAt,
	parseIdOrNotFound,
	requireUser,
	selectEntries,
	toEntryDto,
} from "../lib/snack-bar"

export const snackBarTransaction = server.snackBarTransaction.handler(
	async ({ context, input }) => {
		const sessionUser = requireUser(context)
		const id = parseIdOrNotFound(input.id, "sle")

		const row = await selectEntries(context.db)
			.where(
				and(
					eq(snackLedgerEntry.id, id),
					eq(snackLedgerEntry.userId, sessionUser.id),
				),
			)
			.get()
		if (!row) {
			throw new ORPCError("NOT_FOUND")
		}

		const latestPaymentAt = await getLatestPaymentAt(context.db, sessionUser.id)
		return toEntryDto(row, canUserVoid(row.entry, latestPaymentAt))
	},
)
