import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	DoorControls,
	Text,
} from "@batchmate/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import { useState } from "react"
import { ScrollView, View } from "react-native"
import { api } from "../../src/lib/api"
import { signOut, useSession } from "../../src/lib/auth"

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

	async function handleSignOut() {
		await signOut()
		router.replace("/(auth)/login")
	}

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="items-center px-6 py-12 gap-8"
		>
			<View className="w-full flex-row items-center justify-between">
				<Text className="text-2xl font-bold">Batchmate</Text>
				<Button variant="outline" onPress={handleSignOut}>
					<Text>Sign out</Text>
				</Button>
			</View>

			<DoorControls
				onOpenDoor={(floor, entry) => openDoor.mutate({ floor, entry })}
				isPending={openDoor.isPending}
				pendingDoor={pendingDoor}
			/>

			<View className="items-center gap-2">
				<Text className="text-sm text-muted-foreground">
					{health.isLoading
						? "Connecting..."
						: health.isError
							? `Error: ${health.error.message}`
							: `API: ${health.data?.status ?? "unknown"}`}
				</Text>
			</View>

			{session?.user ? (
				<Card className="w-full">
					<CardHeader>
						<CardTitle>
							<Text>User</Text>
						</CardTitle>
					</CardHeader>
					<CardContent className="gap-1">
						<Text className="text-sm">
							<Text className="font-medium">Name: </Text>
							{session.user.name}
						</Text>
						<Text className="text-sm">
							<Text className="font-medium">Email: </Text>
							{session.user.email}
						</Text>
					</CardContent>
				</Card>
			) : null}
		</ScrollView>
	)
}
