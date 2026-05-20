import { zoomRoom } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { server } from "../context"

export const zoomRooms = server.zoomRooms.handler(async ({ context }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED")
	}

	const rows = await context.db
		.select({
			slug: zoomRoom.slug,
			label: zoomRoom.label,
			directUrl: zoomRoom.directUrl,
		})
		.from(zoomRoom)
		.all()

	return rows
})
