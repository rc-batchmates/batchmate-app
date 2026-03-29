import { ORPCError } from "@orpc/server"
import { server } from "../context"

export const doorsOpen = server.doorsOpen.handler(async ({ input, context }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED")
	}

	const { floor, entry } = input

	// TODO: implement door opening logic
	console.log(
		`User ${context.user.id} requested to open floor ${floor} ${entry} door`,
	)

	return { success: true }
})
