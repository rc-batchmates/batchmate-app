import { snackSku } from "@batchmate/db/schema"
import { server } from "../context"
import { requireAdmin, toSkuDto } from "../lib/snack-bar"

export const snackBarAdminSkuCreate = server.snackBarAdminSkuCreate.handler(
	async ({ context, input }) => {
		requireAdmin(context)
		const [sku] = await context.db
			.insert(snackSku)
			.values({ name: input.name, priceCents: input.priceCents })
			.returning()
		return toSkuDto(sku)
	},
)
