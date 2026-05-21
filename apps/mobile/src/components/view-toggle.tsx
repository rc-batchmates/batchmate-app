import { LayoutGrid, List } from "lucide-react-native"
import { Pressable, View } from "react-native"
import type { View as ViewMode } from "../lib/use-stored-view"

export function ViewToggle({
	view,
	onSetView,
}: {
	view: ViewMode
	onSetView: (v: ViewMode) => void
}) {
	return (
		<View className="ml-auto flex-row overflow-hidden rounded-full border border-border">
			<Pressable
				onPress={() => onSetView("grid")}
				className={`px-2.5 py-1.5 ${view === "grid" ? "bg-cyan/15" : ""}`}
				accessibilityLabel="Photo grid view"
			>
				<LayoutGrid size={16} color={view === "grid" ? "#22D3EE" : "#64748B"} />
			</Pressable>
			<Pressable
				onPress={() => onSetView("list")}
				className={`px-2.5 py-1.5 ${view === "list" ? "bg-cyan/15" : ""}`}
				accessibilityLabel="List view"
			>
				<List size={16} color={view === "list" ? "#22D3EE" : "#64748B"} />
			</Pressable>
		</View>
	)
}
