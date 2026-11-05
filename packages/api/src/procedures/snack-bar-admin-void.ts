import { server } from "../context"
import {
	getBalanceCents,
	parseIdOrNotFound,
	requireAdmin,
	toEntryDto,
	voidEntry,
} from "../lib/snack-bar"

export const snackBarAdminVoid = server.snackBarAdminVoid.handler(
	async ({ context, input }) => {
		const admin = requireAdmin(context)
		const row = await voidEntry(
			context.db,
			parseIdOrNotFound(input.id, "sle"),
			admin.id,
		)
		return {
			entry: toEntryDto(row, false),
			balanceCents: await getBalanceCents(context.db, row.entry.userId),
		}
	},
)
