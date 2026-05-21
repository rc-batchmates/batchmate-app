import { ORPCError } from "@orpc/server"
import { server } from "../context"
import {
	fetchPresentationsInWindow,
	getUpcomingThursdaySessionUtcMs,
	MAX_SIGNUPS,
} from "../firebase-presentations"

export const presentationsList = server.presentationsList.handler(
	async ({ context }) => {
		if (!context.user) {
			throw new ORPCError("UNAUTHORIZED")
		}

		const { sessionStartMs, startMs, endMs } = getUpcomingThursdaySessionUtcMs()

		let data: Record<string, unknown> | null
		try {
			data = await fetchPresentationsInWindow(startMs, endMs)
		} catch (err) {
			console.error("presentations list failed", err)
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to load presentations",
			})
		}

		const presentations = Object.entries(data ?? {})
			.map(([id, raw]) => {
				const r = raw as {
					presenter?: string
					title?: string
					date?: number
					lastUpdated?: number
				}
				return {
					id,
					presenter: r.presenter ?? "",
					title: r.title ?? "",
					date: typeof r.date === "number" ? r.date : null,
					lastUpdated: typeof r.lastUpdated === "number" ? r.lastUpdated : null,
				}
			})
			.sort((a, b) => (a.date ?? 0) - (b.date ?? 0))

		return {
			sessionStartMs,
			windowStartMs: startMs,
			windowEndMs: endMs,
			maxSignUps: MAX_SIGNUPS,
			presentations,
		}
	},
)
