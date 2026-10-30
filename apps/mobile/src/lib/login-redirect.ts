import type { Href } from "expo-router"

// Where to go after logging in, e.g. a Snack Bar link tapped while logged
// out. In-app paths only.
export function loginRedirectTarget(redirect: unknown): Href {
	return typeof redirect === "string" && /^\/(?![/\\])/.test(redirect)
		? (redirect as Href)
		: "/(app)"
}
