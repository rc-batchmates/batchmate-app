import { type DoorAction, DoorControls, Text, ZoomLinks } from "@batchmate/ui"
import { User } from "lucide-react-native"
import { useState } from "react"
import { ScrollView, View } from "react-native"

export default function DemoHomeScreen() {
	const [pendingAction, setPendingAction] = useState<DoorAction | null>(null)
	const [justUnlocked, setJustUnlocked] = useState<DoorAction | null>(null)

	function handleOpenDoor(action: DoorAction) {
		setPendingAction(action)
		setTimeout(() => {
			setPendingAction(null)
			setJustUnlocked(action)
		}, 800)
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

			{/* API Status — hidden in demo since it's always "connected" */}

			{/* Door Controls */}
			<DoorControls
				onOpenDoor={handleOpenDoor}
				isPending={pendingAction !== null}
				pendingAction={pendingAction}
				justUnlockedAction={justUnlocked}
				onUnlockEnd={() => setJustUnlocked(null)}
			/>

			{/* Zoom Rooms */}
			<ZoomLinks />
		</ScrollView>
	)
}
