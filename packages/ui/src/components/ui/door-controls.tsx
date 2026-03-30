import { ArrowUpDown, Footprints } from "lucide-react-native"
import { Pressable, View } from "react-native"
import { Text } from "./text"

type Floor = "4" | "5"
type Entry = "elevator" | "stairs"

export interface DoorControlsProps {
	onOpenDoor: (floor: Floor, entry: Entry) => void
	isPending?: boolean
	pendingDoor?: { floor: Floor; entry: Entry } | null
}

const doors: {
	floor: Floor
	entry: Entry
	title: string
	subtitle: string
	icon: typeof Footprints
}[] = [
	{
		floor: "4",
		entry: "stairs",
		title: "4th Floor",
		subtitle: "Stairs",
		icon: Footprints,
	},
	{
		floor: "4",
		entry: "elevator",
		title: "4th Floor",
		subtitle: "Elevator",
		icon: ArrowUpDown,
	},
	{
		floor: "5",
		entry: "stairs",
		title: "5th Floor",
		subtitle: "Stairs",
		icon: Footprints,
	},
	{
		floor: "5",
		entry: "elevator",
		title: "5th Floor",
		subtitle: "Elevator",
		icon: ArrowUpDown,
	},
]

function DoorCard({
	door,
	onPress,
	isPending,
	isThis,
}: {
	door: (typeof doors)[number]
	onPress: () => void
	isPending?: boolean
	isThis: boolean
}) {
	const Icon = door.icon
	return (
		<Pressable
			className="flex-1 justify-between rounded-xl bg-card p-5"
			style={{ height: 140 }}
			onPress={onPress}
			disabled={isPending}
		>
			<View className="flex-row items-center justify-between">
				<View className="h-10 w-10 items-center justify-center rounded-[10px] bg-surface-inset">
					<Icon size={20} color="#22D3EE" />
				</View>
				<Text className="font-mono text-xl font-bold text-primary">
					{door.floor}F
				</Text>
			</View>
			<View className="gap-0.5">
				<Text className="text-[15px] font-semibold">
					{isThis && isPending ? "Opening..." : door.title}
				</Text>
				<Text className="font-mono text-xs text-text-tertiary">
					{door.subtitle}
				</Text>
			</View>
		</Pressable>
	)
}

function DoorControls({
	onOpenDoor,
	isPending,
	pendingDoor,
}: DoorControlsProps) {
	return (
		<View className="w-full gap-4">
			<View className="flex-row items-center justify-between">
				<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
					DOOR CONTROLS
				</Text>
				<Text className="text-xs text-text-muted">Tap to open</Text>
			</View>
			<View className="gap-3">
				<View className="flex-row gap-3">
					{doors.slice(0, 2).map((door) => (
						<DoorCard
							key={`${door.floor}-${door.entry}`}
							door={door}
							onPress={() => onOpenDoor(door.floor, door.entry)}
							isPending={isPending}
							isThis={
								pendingDoor?.floor === door.floor &&
								pendingDoor?.entry === door.entry
							}
						/>
					))}
				</View>
				<View className="flex-row gap-3">
					{doors.slice(2, 4).map((door) => (
						<DoorCard
							key={`${door.floor}-${door.entry}`}
							door={door}
							onPress={() => onOpenDoor(door.floor, door.entry)}
							isPending={isPending}
							isThis={
								pendingDoor?.floor === door.floor &&
								pendingDoor?.entry === door.entry
							}
						/>
					))}
				</View>
			</View>
		</View>
	)
}

export { DoorControls }
