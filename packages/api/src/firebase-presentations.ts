const FIREBASE_BASE = "https://rc-presentations.firebaseio.com"

export const SERVER_TIMESTAMP = { ".sv": "timestamp" } as const

export const MAX_SIGNUPS = 9

export interface RawPresentation {
	date?: number
	lastUpdated?: number
	presenter?: string
	title?: string
}

async function asJson<T>(res: Response, context: string): Promise<T> {
	if (!res.ok) {
		const body = await res.text().catch(() => "")
		throw new Error(`Firebase ${context} failed: ${res.status} ${body}`)
	}
	return (await res.json()) as T
}

// Firebase push IDs use the URL-safe alphabet "A-Za-z0-9_-". Any deviation —
// empty string, "/", ".", "..", whitespace — could collapse the REST URL onto
// the parent collection (`/presentations/.json`) and let a missing id wipe
// every presentation. Reject before we ever build the URL.
const SAFE_ID_RE = /^[A-Za-z0-9_-]+$/

function assertSafeId(id: unknown): asserts id is string {
	if (typeof id !== "string" || id.length === 0 || !SAFE_ID_RE.test(id)) {
		throw new Error(`Refusing Firebase write: unsafe presentation id`)
	}
}

export async function fetchPresentationsInWindow(
	startMs: number,
	endMs: number,
): Promise<Record<string, RawPresentation> | null> {
	const url =
		`${FIREBASE_BASE}/presentations.json` +
		`?orderBy=${encodeURIComponent('"date"')}` +
		`&startAt=${startMs}&endAt=${endMs}`
	const res = await fetch(url)
	return asJson<Record<string, RawPresentation> | null>(res, "list")
}

export async function createPresentation(input: {
	presenter: string
	title: string
}): Promise<string> {
	const res = await fetch(`${FIREBASE_BASE}/presentations.json`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			presenter: input.presenter,
			title: input.title,
			date: SERVER_TIMESTAMP,
			lastUpdated: SERVER_TIMESTAMP,
		}),
	})
	const body = await asJson<{ name: string }>(res, "create")
	return body.name
}

export async function updatePresentation(
	id: string,
	fields: { presenter?: string; title?: string },
): Promise<void> {
	assertSafeId(id)
	const body: Record<string, unknown> = { lastUpdated: SERVER_TIMESTAMP }
	if (fields.presenter !== undefined) body.presenter = fields.presenter
	if (fields.title !== undefined) body.title = fields.title

	const res = await fetch(`${FIREBASE_BASE}/presentations/${id}.json`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})
	await asJson<unknown>(res, "update")
}

export async function deletePresentation(id: string): Promise<void> {
	assertSafeId(id)
	const res = await fetch(`${FIREBASE_BASE}/presentations/${id}.json`, {
		method: "DELETE",
	})
	if (!res.ok) {
		const body = await res.text().catch(() => "")
		throw new Error(`Firebase delete failed: ${res.status} ${body}`)
	}
}

// Presentations are on Thursdays at 4:00 PM ET. The sign-up cutoff is
// Thursday 5:30 PM ET in NY local time (DST-aware) — same instant for both
// the window's right edge and the flip to next week's session, so there is
// no seam where new sign-ups appear to vanish.
const NY_TZ = "America/New_York"
const CUTOFF_HOUR_ET = 17
const CUTOFF_MIN_ET = 30
const SESSION_HOUR_ET = 16
const THURSDAY = 4
const WEEKDAY_INDEX: Record<string, number> = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6,
}

function getNyParts(d: Date) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: NY_TZ,
		year: "numeric",
		month: "numeric",
		day: "numeric",
		weekday: "short",
		hour12: false,
	}).formatToParts(d)
	const m: Record<string, string> = {}
	for (const p of parts) m[p.type] = p.value
	return {
		year: Number(m.year),
		month: Number(m.month),
		day: Number(m.day),
		weekday: WEEKDAY_INDEX[m.weekday] ?? 0,
	}
}

function getNyOffsetMs(d: Date): number {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: NY_TZ,
		timeZoneName: "longOffset",
	}).formatToParts(d)
	const tz = parts.find((p) => p.type === "timeZoneName")?.value
	const match = tz?.match(/GMT([+-])(\d{1,2}):(\d{2})/)
	if (!match) return -5 * 60 * 60 * 1000
	const sign = match[1] === "+" ? 1 : -1
	const h = Number(match[2])
	const min = Number(match[3])
	return sign * (h * 3600 + min * 60) * 1000
}

// Convert a wall-clock NY date/time to a UTC timestamp. Thursdays at our
// chosen hours never coincide with US DST transitions (those happen on
// Sundays in March and November), so the offset lookup is unambiguous.
function nyWallClockToUtcMs(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
): number {
	const naive = Date.UTC(year, month - 1, day, hour, minute, 0, 0)
	const offset = getNyOffsetMs(new Date(naive))
	return naive - offset
}

export function getUpcomingThursdaySessionUtcMs(now: Date = new Date()): {
	startMs: number
	endMs: number
	sessionStartMs: number
} {
	const ny = getNyParts(now)

	let daysAhead = (THURSDAY - ny.weekday + 7) % 7
	if (daysAhead === 0) {
		const todayCutoff = nyWallClockToUtcMs(
			ny.year,
			ny.month,
			ny.day,
			CUTOFF_HOUR_ET,
			CUTOFF_MIN_ET,
		)
		if (now.getTime() > todayCutoff) {
			daysAhead = 7
		}
	}

	// Walk N days forward in UTC date space to land on the target NY date.
	// Safe because we're only adding whole days and reading back y/m/d, which
	// gives the right calendar slot regardless of DST.
	const advanced = new Date(Date.UTC(ny.year, ny.month - 1, ny.day))
	advanced.setUTCDate(advanced.getUTCDate() + daysAhead)
	const y = advanced.getUTCFullYear()
	const m = advanced.getUTCMonth() + 1
	const d = advanced.getUTCDate()

	const sessionStartMs = nyWallClockToUtcMs(y, m, d, SESSION_HOUR_ET, 0)
	const endMs = nyWallClockToUtcMs(y, m, d, CUTOFF_HOUR_ET, CUTOFF_MIN_ET)
	const oneWeekMs = 7 * 24 * 60 * 60 * 1000

	return {
		sessionStartMs,
		startMs: endMs - oneWeekMs,
		endMs,
	}
}
