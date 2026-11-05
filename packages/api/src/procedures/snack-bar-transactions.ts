import { snackLedgerEntry } from "@batchmate/db/schema"
import { and, desc, eq, lt } from "drizzle-orm"
import { server } from "../context"
import {
	canUserVoid,
	getLatestPaymentAt,
	parseIdOrNotFound,
	requireUser,
	selectEntries,
	toEntryDto,
} from "../lib/snack-bar"

const DEFAULT_PAGE_SIZE = 30

export const snackBarTransactions = server.snackBarTransactions.handler(
	async ({ context, input }) => {
		const sessionUser = requireUser(context)
		const limit = input.limit ?? DEFAULT_PAGE_SIZE

		// TypeIDs are time-sortable, so the id doubles as the page cursor.
		const conditions = [eq(snackLedgerEntry.userId, sessionUser.id)]
		if (input.cursor) {
			conditions.push(
				lt(snackLedgerEntry.id, parseIdOrNotFound(input.cursor, "sle")),
			)
		}

		const [rows, latestPaymentAt] = await Promise.all([
			selectEntries(context.db)
				.where(and(...conditions))
				.orderBy(desc(snackLedgerEntry.id))
				.limit(limit + 1)
				.all(),
			getLatestPaymentAt(context.db, sessionUser.id),
		])

		const page = rows.slice(0, limit)
		const now = Date.now()
		return {
			entries: page.map((row) =>
				toEntryDto(row, canUserVoid(row.entry, latestPaymentAt, now)),
			),
			nextCursor: rows.length > limit ? page[page.length - 1].entry.id : null,
		}
	},
)
