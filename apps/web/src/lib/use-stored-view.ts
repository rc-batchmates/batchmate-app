import { useEffect, useState } from "react"

export type View = "grid" | "list"

export function useStoredView(
	key: string,
	defaultView: View = "grid",
): [View, (v: View) => void] {
	const fullKey = `batchmate:view:${key}`
	const [view, setView] = useState<View>(defaultView)

	useEffect(() => {
		const stored = localStorage.getItem(fullKey)
		if (stored === "list" || stored === "grid") setView(stored)
	}, [fullKey])

	function update(v: View) {
		setView(v)
		localStorage.setItem(fullKey, v)
	}

	return [view, update]
}
