import { ORPCError } from "@orpc/server"
import { server } from "../context"

export const batches = server.batches.handler(async ({ context }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED")
	}

	if (!context.recurseApi) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Recurse API not available",
		})
	}

	const { data, error } = await context.recurseApi.GET("/batches")

	if (error || !data) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Failed to fetch batches",
		})
	}

	return data.map((batch) => ({
		id: batch.id,
		name: batch.name,
		shortName: batch.short_name ?? null,
	}))
})
