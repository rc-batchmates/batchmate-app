import { snackSku } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { server } from "../context"
import { parseIdOrNotFound, requireUser, toSkuDto } from "../lib/snack-bar"

export const snackBarSku = server.snackBarSku.handler(
	async ({ context, input }) => {
		requireUser(context)
		const sku = await context.db
			.select()
			.from(snackSku)
			.where(eq(snackSku.id, parseIdOrNotFound(input.id, "sku")))
			.get()
		if (!sku) {
			throw new ORPCError("NOT_FOUND")
		}
		return toSkuDto(sku)
	},
)
