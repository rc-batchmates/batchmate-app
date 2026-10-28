import { type Database, parseTypeId, type TypeId } from "@batchmate/db"
import { snackLedgerEntry, type snackSku, user } from "@batchmate/db/schema"
import { ORPCError } from "@orpc/server"
import { and, eq, isNull, max, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/sqlite-core"
import type { BaseContext } from "../context"
import type { SnackLedgerEntry, SnackSku } from "../contract"
import { isSnackBarAdmin } from "../snack-bar-admins"

export const SNACK_BAR_TIME_ZONE = "America/New_York"
const USER_VOID_WINDOW_MS = 24 * 60 * 60 * 1000

type SessionUser = NonNullable<BaseContext["user"]>

export function requireUser(context: { user: BaseContext["user"] }) {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED")
	}
	return context.user
}

export function requireAdmin(context: { user: BaseContext["user"] }) {
	const sessionUser = requireUser(context)
	if (!isSnackBarAdmin(sessionUser.rcId)) {
		throw new ORPCError("FORBIDDEN")
	}
	return sessionUser
}

export function isAdmin(sessionUser: SessionUser) {
	return isSnackBarAdmin(sessionUser.rcId)
}

// parseTypeId throws on malformed input; treat that the same as a missing row.
export function parseIdOrNotFound<T extends string>(id: string, prefix: T) {
	try {
		return parseTypeId(id, prefix)
	} catch {
		throw new ORPCError("NOT_FOUND")
	}
}

export async function getBalanceCents(db: Database, userId: string) {
	const row = await db
		.select({
			balance: sql<number>`coalesce(sum(${snackLedgerEntry.amountCents}), 0)`,
		})
		.from(snackLedgerEntry)
		.where(
			and(
				eq(snackLedgerEntry.userId, userId),
				isNull(snackLedgerEntry.voidedAt),
			),
		)
		.get()
	return row?.balance ?? 0
}

export async function getLatestPaymentAt(db: Database, userId: string) {
	const row = await db
		.select({ latest: max(snackLedgerEntry.createdAt) })
		.from(snackLedgerEntry)
		.where(
			and(
				eq(snackLedgerEntry.userId, userId),
				eq(snackLedgerEntry.kind, "payment"),
				isNull(snackLedgerEntry.voidedAt),
			),
		)
		.get()
	return row?.latest ?? null
}

const recorder = alias(user, "recorder")

// Entries joined with the name of whoever recorded them (admins, for payments).
export function selectEntries(db: Database) {
	return db
		.select({ entry: snackLedgerEntry, recordedByName: recorder.name })
		.from(snackLedgerEntry)
		.leftJoin(recorder, eq(recorder.id, snackLedgerEntry.recordedBy))
}

export async function voidEntry(
	db: Database,
	id: TypeId<"sle">,
	voidedBy: string,
) {
	await db
		.update(snackLedgerEntry)
		.set({ voidedAt: new Date(), voidedBy })
		.where(and(eq(snackLedgerEntry.id, id), isNull(snackLedgerEntry.voidedAt)))
	const row = await selectEntries(db).where(eq(snackLedgerEntry.id, id)).get()
	if (!row) {
		throw new ORPCError("NOT_FOUND")
	}
	return row
}

type EntryRow = {
	entry: typeof snackLedgerEntry.$inferSelect
	recordedByName: string | null
}

// Users may remove their own purchases for 24 hours, and only until a
// payment lands after it — once someone has paid, their history is settled.
export function canUserVoid(
	entry: EntryRow["entry"],
	latestPaymentAt: Date | null,
	now = Date.now(),
) {
	return (
		entry.kind === "purchase" &&
		entry.voidedAt === null &&
		now - entry.createdAt.getTime() < USER_VOID_WINDOW_MS &&
		(latestPaymentAt === null || latestPaymentAt < entry.createdAt)
	)
}

export function toEntryDto(row: EntryRow, canVoid: boolean): SnackLedgerEntry {
	const { entry } = row
	return {
		id: entry.id,
		kind: entry.kind,
		skuId: entry.skuId ?? null,
		skuName: entry.skuName,
		amountCents: entry.amountCents,
		source: entry.source,
		note: entry.note,
		recordedByName: row.recordedByName,
		createdAt: entry.createdAt.toISOString(),
		voidedAt: entry.voidedAt?.toISOString() ?? null,
		canVoid,
	}
}

function zonedParts(utcMs: number) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: SNACK_BAR_TIME_ZONE,
		hourCycle: "h23",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	}).formatToParts(new Date(utcMs))
	const get = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((p) => p.type === type)?.value ?? "00"
	return {
		year: get("year"),
		month: get("month"),
		day: get("day"),
		hour: get("hour"),
		minute: get("minute"),
		second: get("second"),
	}
}

// "YYYY-MM-DD HH:mm:ss" in the hub's time zone.
export function formatSnackBarLocal(date: Date) {
	const p = zonedParts(date.getTime())
	return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`
}

// UTC ms for local midnight at the start of a YYYY-MM-DD day in the hub's
// time zone. Re-derives the offset at the result so DST days land correctly.
export function snackBarDayStartMs(date: string) {
	const [y, m, d] = date.split("-").map(Number)
	const naive = Date.UTC(y, m - 1, d)
	const offsetAt = (utcMs: number) => {
		const p = zonedParts(utcMs)
		return (
			Date.UTC(
				Number(p.year),
				Number(p.month) - 1,
				Number(p.day),
				Number(p.hour),
				Number(p.minute),
				Number(p.second),
			) - utcMs
		)
	}
	const first = naive - offsetAt(naive)
	return naive - offsetAt(first)
}

export function toSkuDto(sku: typeof snackSku.$inferSelect): SnackSku {
	return {
		id: sku.id,
		name: sku.name,
		priceCents: sku.priceCents,
		archived: sku.archivedAt !== null,
	}
}
