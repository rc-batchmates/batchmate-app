import { account } from "@batchmate/db/auth-schema"
import { ORPCError } from "@orpc/server"
import { and, eq } from "drizzle-orm"
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

	// Get the user's RC ID to check if they're checked in
	const rcAccount = await context.db
		.select({ accountId: account.accountId })
		.from(account)
		.where(
			and(
				eq(account.userId, context.user.id),
				eq(account.providerId, "recurse"),
			),
		)
		.get()

	const rcId = rcAccount ? Number(rcAccount.accountId) : null

	const { data, error } = await context.recurseApi.GET("/hub_visits")

	if (error || !data) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Failed to fetch hub visits",
		})
	}

	const isCheckedIn = rcId
		? data.some((visit) => visit.person.id === rcId)
		: false

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

	// Deduplicate by person, keeping the latest check-in
	const latestByPerson = new Map<number, (typeof data)[0]>()
	for (const visit of data) {
		const existing = latestByPerson.get(visit.person.id)
		if (
			!existing ||
			(visit.created_at &&
				(!existing.created_at || visit.created_at > existing.created_at))
		) {
			latestByPerson.set(visit.person.id, visit)
		}
	}

	return {
		isCheckedIn,
		visitors: Array.from(latestByPerson.values()).map((visit) => {
			const profile = profiles.get(visit.person.id)
			return {
				personId: visit.person.id,
				name: visit.person.name,
				imageUrl: profile?.imageUrl ?? null,
				batch: profile?.batch ?? null,
				notes: visit.notes ?? "",
				checkedInAt: visit.created_at ?? "",
			}
		}),
	}
})
