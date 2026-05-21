import * as SecureStore from "expo-secure-store"
import { useEffect, useState } from "react"

export type View = "grid" | "list"

export function useStoredView(
	key: string,
	defaultView: View = "grid",
): [View, (v: View) => void] {
	const fullKey = `batchmate_view_${key}`
	const [view, setView] = useState<View>(defaultView)

	useEffect(() => {
		const stored = SecureStore.getItem(fullKey)
		if (stored === "list" || stored === "grid") setView(stored)
	}, [fullKey])

	function update(v: View) {
		setView(v)
		SecureStore.setItem(fullKey, v)
	}

	return [view, update]
}
