import { Text } from "@batchmate/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import { CheckCircle, ChevronRight, MapPin, Users } from "lucide-react-native"
import { Image, Pressable, ScrollView, View } from "react-native"
import { api } from "../../../src/lib/api"

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

export default function HubScreen() {
	const router = useRouter()
	const queryClient = useQueryClient()
	const {
		data: hub,
		isLoading,
		error,
	} = useQuery(api.hubVisits.queryOptions({}))

	const checkin = useMutation({
		...api.hubCheckin.mutationOptions({}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: api.hubVisits.queryOptions({}).queryKey,
			})
		},
	})

	const visitors = hub?.visitors
	const isCheckedIn = hub?.isCheckedIn ?? false

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
				{visitors && (
					<View className="flex-row items-center gap-1.5 rounded-full bg-cyan/10 px-3.5 py-1.5">
						<View className="h-2 w-2 rounded-full bg-cyan" />
						<Text className="text-[13px] font-medium text-primary">
							{visitors.length} {visitors.length === 1 ? "person" : "people"}
						</Text>
					</View>
				)}
			</View>

			{/* Check in */}
			{hub && !isCheckedIn && (
				<Pressable
					className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-cyan"
					onPress={() => checkin.mutate({})}
					disabled={checkin.isPending}
				>
					<MapPin size={18} color="#0A0F1C" />
					<Text className="text-[15px] font-semibold text-background">
						{checkin.isPending ? "Checking in..." : "Check in to the Hub"}
					</Text>
				</Pressable>
			)}

			{hub && isCheckedIn && (
				<View className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-cyan/20 bg-cyan/10">
					<CheckCircle size={18} color="#22D3EE" />
					<Text className="text-sm font-medium text-primary">
						You're checked in
					</Text>
				</View>
			)}

			{/* Loading */}
			{isLoading && (
				<View className="flex-1 items-center justify-center py-20">
					<Text className="text-sm text-text-tertiary">Loading...</Text>
				</View>
			)}

			{/* Error */}
			{error && (
				<View className="flex-1 items-center justify-center py-20">
					<Text className="text-sm text-destructive">
						Failed to load hub visits
					</Text>
				</View>
			)}

			{/* Empty state */}
			{visitors && visitors.length === 0 && (
				<View className="flex-1 items-center justify-center gap-3 py-20">
					<Users size={48} color="#475569" />
					<Text className="text-sm text-text-tertiary">
						Nobody is in the hub right now
					</Text>
				</View>
			)}

			{/* People list */}
			{visitors && visitors.length > 0 && (
				<View className="gap-2.5">
					{visitors.map((visit) => (
						<PersonCard
							key={visit.personId}
							name={visit.name}
							imageUrl={visit.imageUrl}
							batch={visit.batch}
							onPress={() => router.push(`/(app)/member/${visit.personId}`)}
						/>
					))}
				</View>
			)}
		</ScrollView>
	)
}
