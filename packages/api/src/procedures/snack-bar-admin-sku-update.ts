import { snackSku } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { server } from "../context"
import { parseIdOrNotFound, requireAdmin, toSkuDto } from "../lib/snack-bar"

export const snackBarAdminSkuUpdate = server.snackBarAdminSkuUpdate.handler(
	async ({ context, input }) => {
		requireAdmin(context)
		const id = parseIdOrNotFound(input.id, "sku")

		// Price changes only affect future purchases; past entries keep the
		// amount they were recorded at.
		const [sku] = await context.db
			.update(snackSku)
			.set({
				name: input.name,
				priceCents: input.priceCents,
				...(input.archived !== undefined && {
					archivedAt: input.archived ? new Date() : null,
				}),
			})
			.where(eq(snackSku.id, id))
			.returning()
		if (!sku) {
			throw new ORPCError("NOT_FOUND")
		}
		return toSkuDto(sku)
	},
)
