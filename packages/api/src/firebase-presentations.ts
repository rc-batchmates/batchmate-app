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

// Mirrors presentations.recurse.com (bundle.js): step UTC days forward to
// land on Thursday, anchor at 21:00 UTC for display, end the window at
// Fri 00:00 UTC. The week flips at midnight UTC Friday — same instant as
// the official app — so users see both apps transition in lockstep.
const THURSDAY_UTC = 4
const SESSION_HOUR_UTC = 21
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
const THREE_HOURS_MS = 3 * 60 * 60 * 1000

export function getUpcomingThursdaySessionUtcMs(now: Date = new Date()): {
	startMs: number
	endMs: number
	sessionStartMs: number
} {
	const cursor = new Date(now)
	while (cursor.getUTCDay() !== THURSDAY_UTC) {
		cursor.setUTCDate(cursor.getUTCDate() + 1)
	}
	cursor.setUTCHours(SESSION_HOUR_UTC, 0, 0, 0)
	const sessionStartMs = cursor.getTime()
	const endMs = sessionStartMs + THREE_HOURS_MS

	return {
		sessionStartMs,
		startMs: endMs - ONE_WEEK_MS,
		endMs,
	}
}
