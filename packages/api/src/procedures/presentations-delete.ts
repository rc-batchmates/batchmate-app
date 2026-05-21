import { ORPCError } from "@orpc/server"
import { server } from "../context"
import { deletePresentation } from "../firebase-presentations"

export const presentationsDelete = server.presentationsDelete.handler(
	async ({ context, input }) => {
		if (!context.user) {
			throw new ORPCError("UNAUTHORIZED")
		}

		try {
			await deletePresentation(input.id)
			return { success: true }
		} catch (err) {
			console.error("presentations delete failed", err)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to delete presentation",
			})
		}
	},
)
