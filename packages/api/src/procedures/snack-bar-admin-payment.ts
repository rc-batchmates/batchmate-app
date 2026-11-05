import { snackLedgerEntry, user } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { server } from "../context"
import {
	getBalanceCents,
	requireAdmin,
	selectEntries,
	toEntryDto,
} from "../lib/snack-bar"

export const snackBarAdminPayment = server.snackBarAdminPayment.handler(
	async ({ context, input }) => {
		const admin = requireAdmin(context)

		const account = await context.db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.id, input.userId))
			.get()
		if (!account) {
			throw new ORPCError("NOT_FOUND")
		}

		const [{ id }] = await context.db
			.insert(snackLedgerEntry)
			.values({
				userId: account.id,
				kind: "payment",
				amountCents: -input.amountCents,
				source: "admin",
				note: input.note || null,
				paymentRecipient: input.recipient || null,
				recordedBy: admin.id,
			})
			.returning({ id: snackLedgerEntry.id })

		const row = await selectEntries(context.db)
			.where(eq(snackLedgerEntry.id, id))
			.get()
		if (!row) {
			throw new ORPCError("INTERNAL_SERVER_ERROR")
		}
		return {
			entry: toEntryDto(row, true),
			balanceCents: await getBalanceCents(context.db, account.id),
		}
	},
)
