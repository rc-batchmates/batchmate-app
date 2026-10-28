import { useState } from "react"

export type ThemePreference = "system" | "light" | "dark"

const KEY = "batchmate:theme"

// The app is dark by default; light and system are opt-in from the profile.
function read(): ThemePreference {
	const stored = localStorage.getItem(KEY)
	return stored === "light" || stored === "system" ? stored : "dark"
}

// Same logic as the inline script in index.html, which applies the saved
// theme before first paint and follows OS changes in system mode.
function apply(pref: ThemePreference) {
	const light =
		pref === "light" ||
		(pref === "system" &&
			window.matchMedia("(prefers-color-scheme: light)").matches)
	document.documentElement.classList.toggle("light", light)
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute("content", light ? "#f8fafc" : "#0a0f1c")
}

export function useThemePreference(): [
	ThemePreference,
	(p: ThemePreference) => void,
] {
	const [pref, setPref] = useState(read)

	function update(p: ThemePreference) {
		setPref(p)
		localStorage.setItem(KEY, p)
		apply(p)
	}

	return [pref, update]
}
