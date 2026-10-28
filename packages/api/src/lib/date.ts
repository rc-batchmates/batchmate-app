// Hub days follow RC's local calendar, not the worker's (UTC) clock.
export function todayInNY(): string {
	return new Date().toLocaleDateString("en-CA", {
		timeZone: "America/New_York",
	})
}
