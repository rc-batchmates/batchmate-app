import { server } from "../context"
import { getBalanceCents, isAdmin, requireUser } from "../lib/snack-bar"

export const snackBarSummary = server.snackBarSummary.handler(
	async ({ context }) => {
		const sessionUser = requireUser(context)
		return {
			balanceCents: await getBalanceCents(context.db, sessionUser.id),
			isAdmin: isAdmin(sessionUser),
		}
	},
)
