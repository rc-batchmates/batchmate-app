// Hub dates are plain "YYYY-MM-DD" strings on RC's local (America/New_York)
// calendar. Arithmetic runs at UTC noon so DST shifts can't roll the day.

export function hubToday(): string {
	return new Date().toLocaleDateString("en-CA", {
		timeZone: "America/New_York",
	})
}

function ymdToUtcNoon(ymd: string): Date {
	const [y, m, d] = ymd.split("-").map(Number)
	return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12))
}

export function shiftHubDate(ymd: string, days: number): string {
	const date = ymdToUtcNoon(ymd)
	date.setUTCDate(date.getUTCDate() + days)
	return date.toISOString().slice(0, 10)
}

// "Sep 23" for the current year, "Sep 23, 2025" otherwise, to stay short
// enough for a phone-width header.
export function formatHubDate(ymd: string): string {
	const sameYear = ymd.slice(0, 4) === hubToday().slice(0, 4)
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: sameYear ? undefined : "numeric",
		timeZone: "UTC",
	}).format(ymdToUtcNoon(ymd))
}

// Native date pickers work in the device's local time zone.
export function hubDateToLocalDate(ymd: string): Date {
	const [y, m, d] = ymd.split("-").map(Number)
	return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function localDateToHubDate(date: Date): string {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, "0")
	const d = String(date.getDate()).padStart(2, "0")
	return `${y}-${m}-${d}`
}
