import { ORPCError } from "@orpc/server"
import { server } from "../context"

export const memberProfile = server.memberProfile.handler(
	async ({ input, context }) => {
		if (!context.user) {
			throw new ORPCError("UNAUTHORIZED")
		}

		if (!context.recurseApi) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Recurse API not available",
			})
		}

		const { data, error } = await context.recurseApi.GET(
			"/profiles/{person_id_or_email}",
			{ params: { path: { person_id_or_email: String(input.id) } } },
		)

		if (error || !data) {
			throw new ORPCError("NOT_FOUND", {
				message: "Member not found",
			})
		}

		const lastStint = data.stints?.[data.stints.length - 1]

		return {
			id: data.id,
			firstName: data.first_name,
			lastName: data.last_name,
			name: data.name ?? `${data.first_name} ${data.last_name}`,
			email: data.email ?? null,
			imageUrl: data.image_path ?? null,
			slug: data.slug ?? null,
			pronouns: data.pronouns ?? null,
			github: data.github ?? null,
			twitter: data.twitter ?? null,
			linkedin: data.linkedin ?? null,
			personalSiteUrl: data.personal_site_url ?? null,
			zulipId: data.zulip_id ?? null,
			bio: data.bio_hl ?? null,
			interests: data.interests_hl ?? null,
			beforeRc: data.before_rc_hl ?? null,
			duringRc: data.during_rc_hl ?? null,
			batch: lastStint?.batch?.name ?? null,
			currentLocation: data.current_location?.name ?? null,
			company: data.company?.name ?? null,
		}
	},
)
