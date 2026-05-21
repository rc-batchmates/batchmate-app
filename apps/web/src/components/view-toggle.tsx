import { LayoutGrid, List } from "lucide-react"
import type { View } from "@/lib/use-stored-view"

export function ViewToggle({
	view,
	onSetView,
}: {
	view: View
	onSetView: (v: View) => void
}) {
	return (
		<div className="ml-auto flex overflow-hidden rounded-full border border-border">
			<button
				type="button"
				onClick={() => onSetView("grid")}
				aria-label="Photo grid view"
				className={`flex cursor-pointer items-center justify-center px-2.5 py-1.5 ${
					view === "grid" ? "bg-cyan/15 text-cyan" : "text-text-tertiary"
				}`}
			>
				<LayoutGrid size={16} />
			</button>
			<button
				type="button"
				onClick={() => onSetView("list")}
				aria-label="List view"
				className={`flex cursor-pointer items-center justify-center px-2.5 py-1.5 ${
					view === "list" ? "bg-cyan/15 text-cyan" : "text-text-tertiary"
				}`}
			>
				<List size={16} />
			</button>
		</div>
	)
}
