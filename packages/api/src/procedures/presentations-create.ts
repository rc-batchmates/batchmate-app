import { ORPCError } from "@orpc/server"
import { server } from "../context"
import {
	createPresentation,
	fetchPresentationsInWindow,
	getUpcomingThursdaySessionUtcMs,
	MAX_SIGNUPS,
} from "../firebase-presentations"

export const presentationsCreate = server.presentationsCreate.handler(
	async ({ context, input }) => {
		if (!context.user) {
			throw new ORPCError("UNAUTHORIZED")
		}

		const { startMs, endMs } = getUpcomingThursdaySessionUtcMs()

		let existing: Awaited<ReturnType<typeof fetchPresentationsInWindow>>
		try {
			existing = await fetchPresentationsInWindow(startMs, endMs)
		} catch (err) {
			console.error("presentations create capacity check failed", err)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to add presentation",
			})
		}

		const count = existing ? Object.keys(existing).length : 0
		if (count >= MAX_SIGNUPS) {
			throw new ORPCError("BAD_REQUEST", {
				message: "All presentation slots are full for this session.",
			})
		}

		try {
			const id = await createPresentation({
				presenter: input.presenter,
				title: input.title,
			})
			const now = Date.now()
			return {
				id,
				presenter: input.presenter,
				title: input.title,
				date: now,
				lastUpdated: now,
			}
		} catch (err) {
			console.error("presentations create failed", err)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to add presentation",
			})
		}
	},
)
