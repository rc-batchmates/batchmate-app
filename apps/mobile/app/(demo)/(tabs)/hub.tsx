import { Text } from "@batchmate/ui"
import { useRouter } from "expo-router"
import { CheckCircle, ChevronRight } from "lucide-react-native"
import { useState } from "react"
import { Image, Pressable, ScrollView, View } from "react-native"

const VISITORS = [
	{
		personId: 1001,
		name: "Alice Zhang",
		imageUrl: null,
		batch: "W1 2025",
	},
	{
		personId: 1002,
		name: "Ben Okafor",
		imageUrl: null,
		batch: "S2 2024",
	},
	{
		personId: 1003,
		name: "Carmen Reyes",
		imageUrl: null,
		batch: "W1 2025",
	},
	{
		personId: 1004,
		name: "David Kim",
		imageUrl: null,
		batch: "F2 2024",
	},
]

function PersonCard({
	name,
	imageUrl,
	batch,
	onPress,
}: {
	name: string
	imageUrl: string | null
	batch: string | null
	onPress: () => void
}) {
	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase()

	return (
		<Pressable
			className="flex-row items-center gap-3 rounded-xl bg-card px-4 py-3.5"
			onPress={onPress}
		>
			<View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-inset">
				{imageUrl ? (
					<Image source={{ uri: imageUrl }} className="h-full w-full" />
				) : (
					<Text className="text-sm font-semibold text-primary">{initials}</Text>
				)}
			</View>
			<View className="flex-1 gap-0.5">
				<Text className="text-[15px] font-medium">{name}</Text>
				<Text className="text-xs text-text-tertiary">
					{batch ?? "Recurser"}
				</Text>
			</View>
			<ChevronRight size={20} color="#475569" />
		</Pressable>
	)
}

export default function DemoHubScreen() {
	const router = useRouter()
	const [checkedIn, setCheckedIn] = useState(false)

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-6"
		>
			{/* Header */}
			<View className="flex-row items-center justify-between">
				<View className="gap-1">
					<Text className="text-sm text-text-tertiary">Currently at RC</Text>
					<Text className="text-2xl font-semibold">In the Hub</Text>
				</View>
				<View className="flex-row items-center gap-1.5 rounded-full bg-cyan/10 px-3.5 py-1.5">
					<View className="h-2 w-2 rounded-full bg-cyan" />
					<Text className="text-[13px] font-medium text-primary">
						{VISITORS.length} people
					</Text>
				</View>
			</View>

			{/* Check in */}
			{checkedIn ? (
				<View className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-cyan/20 bg-cyan/10">
					<CheckCircle size={18} color="#22D3EE" />
					<Text className="text-sm font-medium text-primary">
						You're checked in
					</Text>
				</View>
			) : (
				<Pressable
					className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-cyan"
					onPress={() => setCheckedIn(true)}
				>
					<Text className="text-[15px] font-semibold text-background">
						Check in to the Hub
					</Text>
				</Pressable>
			)}

			{/* People list */}
			<View className="gap-2.5">
				{VISITORS.map((visit) => (
					<PersonCard
						key={visit.personId}
						name={visit.name}
						imageUrl={visit.imageUrl}
						batch={visit.batch}
						onPress={() => router.push(`/(demo)/member/${visit.personId}`)}
					/>
				))}
			</View>
		</ScrollView>
	)
}
