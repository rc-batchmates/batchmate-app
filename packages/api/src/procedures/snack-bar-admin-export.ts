import { snackLedgerEntry, user } from "@batchmate/db/schema"
import { and, asc, eq, gte, lt, type SQL } from "drizzle-orm"
import { alias } from "drizzle-orm/sqlite-core"
import { server } from "../context"
import {
	formatSnackBarLocal,
	requireAdmin,
	snackBarDayStartMs,
} from "../lib/snack-bar"

const COLUMNS = [
	"id",
	"created_at_utc",
	"created_at_local",
	"user_name",
	"user_email",
	"rc_id",
	"kind",
	"sku_id",
	"sku_name",
	"amount",
	"source",
	"note",
	"payment_recipient",
	"recorded_by",
	"voided_at_utc",
	"voided_by",
]

function csvCell(value: string | number | null | undefined) {
	if (value === null || value === undefined) return ""
	const s = String(value)
	return /[",\r\n]/.test(s) ? `"${s.replaceAll(`"`, `""`)}"` : s
}

function nextDay(date: string) {
	const [y, m, d] = date.split("-").map(Number)
	return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10)
}

const recorder = alias(user, "recorder")
const voider = alias(user, "voider")

export const snackBarAdminExport = server.snackBarAdminExport.handler(
	async ({ context, input }) => {
		requireAdmin(context)

		const conditions: SQL[] = []
		if (input.userId) {
			conditions.push(eq(snackLedgerEntry.userId, input.userId))
		}
		if (input.from) {
			conditions.push(
				gte(
					snackLedgerEntry.createdAt,
					new Date(snackBarDayStartMs(input.from)),
				),
			)
		}
		if (input.to) {
			// `to` is inclusive, so stop at the start of the following day.
			conditions.push(
				lt(
					snackLedgerEntry.createdAt,
					new Date(snackBarDayStartMs(nextDay(input.to))),
				),
			)
		}

		const rows = await context.db
			.select({
				entry: snackLedgerEntry,
				userName: user.name,
				userEmail: user.email,
				rcId: user.rcId,
				recordedBy: recorder.name,
				voidedBy: voider.name,
			})
			.from(snackLedgerEntry)
			.innerJoin(user, eq(user.id, snackLedgerEntry.userId))
			.leftJoin(recorder, eq(recorder.id, snackLedgerEntry.recordedBy))
			.leftJoin(voider, eq(voider.id, snackLedgerEntry.voidedBy))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(asc(snackLedgerEntry.id))
			.all()

		const lines = [COLUMNS.join(",")]
		for (const row of rows) {
			const { entry } = row
			lines.push(
				[
					entry.id,
					entry.createdAt.toISOString(),
					formatSnackBarLocal(entry.createdAt),
					row.userName,
					row.userEmail,
					row.rcId,
					entry.kind,
					entry.skuId,
					entry.skuName,
					(entry.amountCents / 100).toFixed(2),
					entry.source,
					entry.note,
					entry.paymentRecipient,
					row.recordedBy,
					entry.voidedAt?.toISOString(),
					row.voidedBy,
				]
					.map(csvCell)
					.join(","),
			)
		}

		const today = formatSnackBarLocal(new Date()).slice(0, 10)
		return {
			filename: `snack-bar_${input.from ?? "all"}_to_${input.to ?? today}.csv`,
			csv: `${lines.join("\r\n")}\r\n`,
		}
	},
)
