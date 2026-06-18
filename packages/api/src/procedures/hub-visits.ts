import { account } from "@batchmate/db/auth-schema"
import { recurseProfile } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { and, eq, inArray, sql } from "drizzle-orm"
import { server } from "../context"
import { getRoleFromCachedStint, getRoleFromStints } from "../lib/role"

const PROFILE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

function hourInNYT(iso: string | null | undefined): number | null {
	if (!iso) return null
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return null
	return Number(
		new Intl.DateTimeFormat("en-US", {
			timeZone: "America/New_York",
			hour: "numeric",
			hour12: false,
		}).format(d),
	)
}

/**
 * fetches the current user's check-in status,
 * and all checked-in users' profiles
 */
export const hubVisits = server.hubVisits.handler(async ({ context }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED")
	}

	if (!context.recurseApi) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Recurse API not available",
		})
	}

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

	let isCheckedIn = false
	if (rcId) {
		const myVisits = data.filter((v) => v.person.id === rcId)
		if (myVisits.length > 0) {
			const latest = myVisits.reduce((a, b) =>
				(a.created_at ?? "") > (b.created_at ?? "") ? a : b,
			)
			const checkInHour = hourInNYT(latest.created_at)
			const nowHour = hourInNYT(new Date().toISOString())
			const isStaleOvernight =
				checkInHour !== null &&
				checkInHour < 5 &&
				nowHour !== null &&
				nowHour >= 5
			isCheckedIn = !isStaleOvernight
		}
	}

	const uniqueIds = [...new Set(data.map((v) => v.person.id))]
	const profiles = new Map<
		number,
		{
			imageUrl: string | null
			batch: string | null
			stintType: string | null
			stintInProgress: boolean | null
			pronouns: string | null
		}
	>()

	if (uniqueIds.length > 0) {
		const cached = await context.db
			.select()
			.from(recurseProfile)
			.where(inArray(recurseProfile.personId, uniqueIds))
			.all()

		const freshCutoff = Date.now() - PROFILE_CACHE_TTL_MS
		const staleIds = new Set(uniqueIds)
		for (const row of cached) {
			if (row.cachedAt.getTime() >= freshCutoff) {
				profiles.set(row.personId, {
					imageUrl: row.imageUrl,
					batch: row.batch,
					stintType: row.stintType,
					stintInProgress: row.stintInProgress,
					pronouns: row.pronouns,
				})
				staleIds.delete(row.personId)
			}
		}

		if (staleIds.size > 0) {
			const fetched = await Promise.allSettled(
				[...staleIds].map(async (id) => {
					const { data: profile } = await context.recurseApi!.GET(
						"/profiles/{person_id_or_email}",
						{ params: { path: { person_id_or_email: String(id) } } },
					)
					if (!profile) return null
					const lastStint = profile.stints?.[profile.stints.length - 1]
					return {
						personId: id,
						imageUrl: profile.image_path ?? null,
						batch: lastStint?.batch?.name ?? null,
						stintType: lastStint?.type ?? null,
						stintInProgress: lastStint?.in_progress ?? false,
						pronouns: profile.pronouns ?? null,
						role: getRoleFromStints(profile.stints),
					}
				}),
			)

			const rows = fetched
				.map((r) => (r.status === "fulfilled" ? r.value : null))
				.filter((r): r is NonNullable<typeof r> => r !== null)

			for (const row of rows) {
				profiles.set(row.personId, {
					imageUrl: row.imageUrl,
					batch: row.batch,
					stintType: row.stintType,
					stintInProgress: row.stintInProgress,
					pronouns: row.pronouns,
				})
			}

			if (rows.length > 0) {
				const now = new Date()
				// D1 caps each statement at ~100 bound parameters. With 7 columns
				// per row, 14 rows fits under the limit with headroom.
				const CHUNK = 14
				for (let i = 0; i < rows.length; i += CHUNK) {
					await context.db
						.insert(recurseProfile)
						.values(
							rows.slice(i, i + CHUNK).map(({ role: _role, ...r }) => ({
								...r,
								cachedAt: now,
							})),
						)
						.onConflictDoUpdate({
							target: recurseProfile.personId,
							set: {
								imageUrl: sql`excluded.image_url`,
								batch: sql`excluded.batch`,
								stintType: sql`excluded.stint_type`,
								stintInProgress: sql`excluded.stint_in_progress`,
								pronouns: sql`excluded.pronouns`,
								cachedAt: sql`excluded.cached_at`,
							},
						})
				}
			}
		}
	}

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
				stintType: profile?.stintType ?? null,
				pronouns: profile?.pronouns ?? null,
				role: profile
					? getRoleFromCachedStint(profile.stintType, profile.stintInProgress)
					: null,
				notes: visit.notes ?? "",
				checkedInAt: visit.created_at ?? "",
			}
		}),
	}
})

// TODO factor out helper functions for shared code with the endpoint above
/** fetches only the current user's check-in status */
export const isCheckedIn = server.isCheckedIn.handler(async ({ context }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED")
	}

	if (!context.recurseApi) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Recurse API not available",
		})
	}

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
	if (!rcAccount) {
		throw new ORPCError("UNAUTHORIZED")
	}

	const person_id = Number(rcAccount.accountId)
	const date = new Date().toISOString()
	const { data: visit, error } = await context.recurseApi.GET(
		"/hub_visits/{person_id}/{date}",
		{ params: { path: { person_id, date } } },
	)

	if (error) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Failed to fetch hub visits",
		})
	}

	return { isCheckedIn: !!visit }
})
