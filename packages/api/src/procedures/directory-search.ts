import { ORPCError } from "@orpc/server"
import { server } from "../context"

export const directorySearch = server.directorySearch.handler(
	async ({ input, context }) => {
		if (!context.user) {
			throw new ORPCError("UNAUTHORIZED")
		}

		if (!context.recurseApi) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Recurse API not available",
			})
		}

		const { data, error } = await context.recurseApi.GET("/profiles", {
			params: {
				query: {
					query: input.query || undefined,
					batch_id: input.batchId,
					location_id: input.locationId,
					role: input.role,
					scope: input.scope,
					limit: input.limit ?? 50,
					offset: input.offset,
				},
			},
		})

		if (error || !data) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to search profiles",
			})
		}

		return {
			people: data.map((profile) => {
				const lastStint = profile.stints?.[profile.stints.length - 1]
				return {
					id: profile.id,
					name: profile.name ?? `${profile.first_name} ${profile.last_name}`,
					imageUrl: profile.image_path ?? null,
					batch: lastStint?.batch?.name ?? null,
					stintType: lastStint?.type ?? null,
				}
			}),
		}
	},
)
