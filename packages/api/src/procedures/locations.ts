import { ORPCError } from "@orpc/server"
import { server } from "../context"

export const locations = server.locations.handler(
	async ({ input, context }) => {
		if (!context.user) {
			throw new ORPCError("UNAUTHORIZED")
		}

		if (!context.recurseApi) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Recurse API not available",
			})
		}

		const { data, error } = await context.recurseApi.GET("/locations", {
			params: {
				query: {
					query: input.query || undefined,
					limit: 50,
				},
			},
		})

		if (error || !data) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to fetch locations",
			})
		}

		return data
			.filter(
				(loc): loc is typeof loc & { id: number; name: string } =>
					loc.id != null && loc.name != null,
			)
			.map((loc) => ({
				id: loc.id,
				name: loc.name,
			}))
	},
)
