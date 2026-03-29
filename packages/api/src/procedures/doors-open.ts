import { ORPCError } from "@orpc/server"
import { server } from "../context"
import type { Entry, Floor } from "../contract"

const outputId: Record<Floor, Record<Entry, number>> = {
	"4": { stairs: 0, elevator: 2 },
	"5": { stairs: 1, elevator: 3 },
}

export const doorsOpen = server.doorsOpen.handler(
	async ({ input, context }) => {
		if (!context.user) {
			throw new ORPCError("UNAUTHORIZED")
		}

		const { error } = await context.securityApi.POST("/v1/panel/outputs", {
			body: {
				operations: [
					{
						output_id: outputId[input.floor][input.entry],
						operation: "pulse",
						duration: 5,
					},
				],
			},
		})

		if (error) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to open door",
			})
		}

		return { success: true }
	},
)
