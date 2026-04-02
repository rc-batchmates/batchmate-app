import { DoorControls, Text, ZoomLinks } from "@batchmate/ui"
import { User } from "lucide-react-native"
import { useState } from "react"
import { ScrollView, View } from "react-native"

export default function DemoHomeScreen() {
	const [pendingDoor, setPendingDoor] = useState<{
		floor: "4" | "5"
		entry: "elevator" | "stairs"
	} | null>(null)

	function handleOpenDoor(floor: "4" | "5", entry: "elevator" | "stairs") {
		setPendingDoor({ floor, entry })
		setTimeout(() => setPendingDoor(null), 800)
	}

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-7"
		>
			{/* Header */}
			<View className="flex-row items-center justify-between">
				<View className="gap-1">
					<Text className="text-sm text-text-tertiary">Welcome back,</Text>
					<Text className="text-2xl font-semibold">Demo</Text>
				</View>
				<View className="h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-card">
					<User size={22} color="#22D3EE" />
				</View>
			</View>

			{/* API Status */}
			<View className="flex-row items-center gap-2.5 rounded-lg bg-card px-4 py-3">
				<View className="h-2 w-2 rounded-full bg-cyan" />
				<Text className="font-mono text-xs font-medium text-primary">
					API Connected
				</Text>
				<Text className="font-mono text-[11px] text-text-muted">
					{new Date().toISOString()}
				</Text>
			</View>

			{/* Door Controls */}
			<DoorControls
				onOpenDoor={handleOpenDoor}
				isPending={pendingDoor !== null}
				pendingDoor={pendingDoor}
			/>

			{/* Zoom Rooms */}
			<ZoomLinks />
		</ScrollView>
	)
}
