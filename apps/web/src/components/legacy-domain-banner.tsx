import { X } from "lucide-react"
import { useEffect, useState } from "react"

const DISMISS_KEY = "batchmate:dismissed-recurse-rocks-banner"

export function LegacyDomainBanner() {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		if (typeof window === "undefined") return
		if (localStorage.getItem(DISMISS_KEY) === "1") return

		const url = new URL(window.location.href)
		const fromLegacyParam = url.searchParams.get("from") === "recurse.rocks"
		const ref = document.referrer
		const fromLegacyReferer =
			ref.startsWith("https://recurse.rocks") ||
			ref.startsWith("http://recurse.rocks")

		if (!fromLegacyParam && !fromLegacyReferer) return

		setVisible(true)

		// Strip the marker so the URL the user sees / shares is clean.
		if (fromLegacyParam) {
			url.searchParams.delete("from")
			const cleaned = `${url.pathname}${url.search}${url.hash}`
			window.history.replaceState(null, "", cleaned)
		}
	}, [])

	if (!visible) return null

	function dismiss() {
		localStorage.setItem(DISMISS_KEY, "1")
		setVisible(false)
	}

	return (
		<div className="sticky top-0 z-50 flex items-center justify-center gap-3 border-b border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-foreground">
			<span className="text-center">
				We've moved to <strong>batchmate.app</strong>. Please update your
				bookmarks — recurse.rocks will go away.
			</span>
			<button
				type="button"
				onClick={dismiss}
				aria-label="Dismiss"
				className="-mr-1 flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-cyan/20 hover:text-foreground"
			>
				<X size={16} />
			</button>
		</div>
	)
}
