import { DoorControls, Text, ZoomLinks } from "@batchmate/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import { User } from "lucide-react-native"
import { useState } from "react"
import { Image, Pressable, ScrollView, View } from "react-native"
import { api } from "../../src/lib/api"
import { useSession } from "../../src/lib/auth"

export default function HomeScreen() {
	const router = useRouter()
	const { data: session } = useSession()
	const health = useQuery(api.health.queryOptions({}))

	const [pendingDoor, setPendingDoor] = useState<{
		floor: "4" | "5"
		entry: "elevator" | "stairs"
	} | null>(null)

	const openDoor = useMutation({
		...api.doorsOpen.mutationOptions({}),
		onMutate: (input) => setPendingDoor(input),
		onSettled: () => setPendingDoor(null),
	})

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-7"
		>
			{/* Header */}
			<View className="flex-row items-center justify-between">
				<View className="gap-1">
					<Text className="text-sm text-text-tertiary">Welcome back,</Text>
					<Text className="text-2xl font-semibold">
						{session?.user?.name?.split(" ")[0] ?? "Recurser"}
					</Text>
				</View>
				<Pressable
					className="h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-card"
					onPress={() => router.push("/(app)/profile")}
				>
					{session?.user?.image ? (
						<Image
							source={{ uri: session.user.image }}
							className="h-full w-full"
						/>
					) : (
						<User size={22} color="#22D3EE" />
					)}
				</Pressable>
			</View>

			{/* API Status */}
			<View className="flex-row items-center gap-2.5 rounded-lg bg-card px-4 py-3">
				<View
					className={`h-2 w-2 rounded-full ${health.isError ? "bg-destructive" : "bg-cyan"}`}
				/>
				<Text className="font-mono text-xs font-medium text-primary">
					{health.isLoading
						? "Connecting..."
						: health.isError
							? "Disconnected"
							: "API Connected"}
				</Text>
				{health.data?.timestamp && (
					<Text className="font-mono text-[11px] text-text-muted">
						{health.data.timestamp}
					</Text>
				)}
			</View>

			{/* Door Controls */}
			<DoorControls
				onOpenDoor={(floor, entry) => openDoor.mutate({ floor, entry })}
				isPending={openDoor.isPending}
				pendingDoor={pendingDoor}
			/>

			{/* Zoom Rooms */}
			<ZoomLinks />
		</ScrollView>
	)
}
