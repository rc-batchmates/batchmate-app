import { snackLedgerEntry, user } from "@batchmate/db/schema"
import { asc, desc, eq, max, sql } from "drizzle-orm"
import { server } from "../context"
import { requireAdmin } from "../lib/snack-bar"

export const snackBarAdminAccounts = server.snackBarAdminAccounts.handler(
	async ({ context, input }) => {
		requireAdmin(context)
		const balance = sql<number>`coalesce(sum(case when ${snackLedgerEntry.voidedAt} is null then ${snackLedgerEntry.amountCents} else 0 end), 0)`

		const query = context.db
			.select({
				userId: snackLedgerEntry.userId,
				name: user.name,
				image: user.image,
				rcId: user.rcId,
				balanceCents: balance,
				lastActivityAt: max(snackLedgerEntry.createdAt),
			})
			.from(snackLedgerEntry)
			.innerJoin(user, eq(user.id, snackLedgerEntry.userId))
			.groupBy(snackLedgerEntry.userId)
			.$dynamic()

		// By default, only people who aren't settled up: positive owes,
		// negative is credit.
		const rows =
			input.scope === "all"
				? await query.orderBy(asc(user.name)).all()
				: await query.having(sql`${balance} != 0`).orderBy(desc(balance)).all()

		return rows.map((row) => ({
			...row,
			lastActivityAt: (row.lastActivityAt ?? new Date(0)).toISOString(),
		}))
	},
)
