import { snackSku } from "@batchmate/db/schema"
import { asc, sql } from "drizzle-orm"
import { server } from "../context"
import { requireAdmin, toSkuDto } from "../lib/snack-bar"

export const snackBarAdminSkus = server.snackBarAdminSkus.handler(
	async ({ context }) => {
		requireAdmin(context)
		const skus = await context.db
			.select()
			.from(snackSku)
			.orderBy(sql`${snackSku.archivedAt} is not null`, asc(snackSku.name))
			.all()
		return skus.map(toSkuDto)
	},
)
