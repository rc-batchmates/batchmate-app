import { ORPCError } from "@orpc/server"
import { server } from "../context"

const DOORBOT_URL = "https://doorbot.recurse.com/api/sesame/intercom"

export const intercomOpen = server.intercomOpen.handler(async ({ context }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED")
	}

	if (!context.doorbotToken) {
		console.error("DOORBOT_TOKEN is not configured")
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Doorbot is not configured",
		})
	}

	const res = await fetch(DOORBOT_URL, {
		method: "POST",
		headers: { Authorization: `Bearer ${context.doorbotToken}` },
	})

	if (!res.ok) {
		console.error(
			`Doorbot intercom request failed: ${res.status} ${res.statusText}`,
		)
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Failed to open main entrance",
		})
	}

	return { success: true }
})
