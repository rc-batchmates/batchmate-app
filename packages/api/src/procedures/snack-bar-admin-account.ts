import { snackLedgerEntry, user } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { desc, eq } from "drizzle-orm"
import { server } from "../context"
import {
	getBalanceCents,
	requireAdmin,
	selectEntries,
	toEntryDto,
} from "../lib/snack-bar"

export const snackBarAdminAccount = server.snackBarAdminAccount.handler(
	async ({ context, input }) => {
		requireAdmin(context)

		const account = await context.db
			.select({
				id: user.id,
				name: user.name,
				image: user.image,
				rcId: user.rcId,
				createdAt: user.createdAt,
			})
			.from(user)
			.where(eq(user.id, input.userId))
			.get()
		if (!account) {
			throw new ORPCError("NOT_FOUND")
		}

		const [rows, balanceCents] = await Promise.all([
			selectEntries(context.db)
				.where(eq(snackLedgerEntry.userId, account.id))
				.orderBy(desc(snackLedgerEntry.id))
				.all(),
			getBalanceCents(context.db, account.id),
		])

		return {
			account: {
				userId: account.id,
				name: account.name,
				image: account.image,
				rcId: account.rcId,
				balanceCents,
				lastActivityAt: (
					rows[0]?.entry.createdAt ?? account.createdAt
				).toISOString(),
			},
			// Admins can void anything that isn't already voided.
			entries: rows.map((row) => toEntryDto(row, row.entry.voidedAt === null)),
		}
	},
)
