import * as SecureStore from "expo-secure-store"
import { useState } from "react"
import { Appearance } from "react-native"

export type ThemePreference = "system" | "light" | "dark"

const KEY = "batchmate_theme"

function read(): ThemePreference {
	const stored = SecureStore.getItem(KEY)
	return stored === "light" || stored === "dark" ? stored : "system"
}

function apply(pref: ThemePreference) {
	// null hands control back to the phone's system setting.
	Appearance.setColorScheme(pref === "system" ? null : pref)
}

/** Call once at startup, before first render, so the saved theme never flashes. */
export function applyStoredThemePreference() {
	apply(read())
}

export function useThemePreference(): [
	ThemePreference,
	(p: ThemePreference) => void,
] {
	const [pref, setPref] = useState(read)

	function update(p: ThemePreference) {
		setPref(p)
		SecureStore.setItem(KEY, p)
		apply(p)
	}

	return [pref, update]
}
