import { account } from "@batchmate/db/auth-schema"
import { recurseProfile } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { and, eq, inArray, sql } from "drizzle-orm"
import { server } from "../context"

const PROFILE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export const hubVisits = server.hubVisits.handler(async ({ context }) => {
	try {
		return await hubVisitsImpl(context)
	} catch (e) {
		console.error("[hubVisits] error", e)
		if (e instanceof ORPCError) throw e
		const msg = e instanceof Error ? `${e.message}\n${e.stack}` : String(e)
		throw new ORPCError("INTERNAL_SERVER_ERROR", { message: msg })
	}
})

async function hubVisitsImpl(
	context: Parameters<Parameters<typeof server.hubVisits.handler>[0]>[0]["context"],
) {
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

	const isCheckedIn = rcId
		? data.some((visit) => visit.person.id === rcId)
		: false

	const uniqueIds = [...new Set(data.map((v) => v.person.id))]
	const profiles = new Map<
		number,
		{
			imageUrl: string | null
			batch: string | null
			stintType: string | null
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
				})
			}

			if (rows.length > 0) {
				const now = new Date()
				await context.db
					.insert(recurseProfile)
					.values(rows.map((r) => ({ ...r, cachedAt: now })))
					.onConflictDoUpdate({
						target: recurseProfile.personId,
						set: {
							imageUrl: sql`excluded.image_url`,
							batch: sql`excluded.batch`,
							stintType: sql`excluded.stint_type`,
							cachedAt: sql`excluded.cached_at`,
						},
					})
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
				notes: visit.notes ?? "",
				checkedInAt: visit.created_at ?? "",
			}
		}),
	}
}
