import { ORPCError } from "@orpc/server"
import { server } from "../context"
import { updatePresentation } from "../firebase-presentations"

export const presentationsUpdate = server.presentationsUpdate.handler(
	async ({ context, input }) => {
		if (!context.user) {
			throw new ORPCError("UNAUTHORIZED")
		}

		try {
			await updatePresentation(input.id, {
				presenter: input.presenter,
				title: input.title,
			})
			return { success: true }
		} catch (err) {
			console.error("presentations update failed", err)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to update presentation",
			})
		}
	},
)
