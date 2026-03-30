import { ORPCError } from "@orpc/server"
import { server } from "../context"

export const hubVisits = server.hubVisits.handler(async ({ context }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED")
	}

	if (!context.recurseApi) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Recurse API not available",
		})
	}

	const { data, error } = await context.recurseApi.GET("/hub_visits")

	if (error || !data) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Failed to fetch hub visits",
		})
	}

	// Hub visits only return person {id, name}. Fetch profiles in parallel
	// to get images and batch info. This is N+1 but unavoidable — the RC API
	// has no batch endpoint for hub visitors and scope=current returns people
	// in batch, not in the hub. Consider caching profiles if this gets slow.
	const uniqueIds = [...new Set(data.map((v) => v.person.id))]
	const profiles = new Map<
		number,
		{ imageUrl: string | null; batch: string | null }
	>()

	await Promise.allSettled(
		uniqueIds.map(async (id) => {
			const { data: profile } = await context.recurseApi!.GET(
				"/profiles/{person_id_or_email}",
				{ params: { path: { person_id_or_email: String(id) } } },
			)
			if (profile) {
				const lastStint = profile.stints?.[profile.stints.length - 1]
				profiles.set(id, {
					imageUrl: profile.image_path ?? null,
					batch: lastStint?.batch?.name ?? null,
				})
			}
		}),
	)

	return data.map((visit) => {
		const profile = profiles.get(visit.person.id)
		return {
			personId: visit.person.id,
			name: visit.person.name,
			imageUrl: profile?.imageUrl ?? null,
			batch: profile?.batch ?? null,
			notes: visit.notes ?? "",
			checkedInAt: visit.created_at ?? "",
		}
	})
})
