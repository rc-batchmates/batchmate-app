import { getInitials, getSubtitle, SCOPES, Text } from "@batchmate/ui"
import { useRouter } from "expo-router"
import { ChevronRight, Search } from "lucide-react-native"
import { useState } from "react"
import { FlatList, Image, Pressable, TextInput, View } from "react-native"

const PEOPLE = [
	{
		id: 1001,
		name: "Alice Zhang",
		imageUrl: null,
		batch: "W1 2025",
		stintType: "recurser",
	},
	{
		id: 1002,
		name: "Ben Okafor",
		imageUrl: null,
		batch: "S2 2024",
		stintType: "recurser",
	},
	{
		id: 1003,
		name: "Carmen Reyes",
		imageUrl: null,
		batch: "W1 2025",
		stintType: "recurser",
	},
	{
		id: 1004,
		name: "David Kim",
		imageUrl: null,
		batch: "F2 2024",
		stintType: "recurser",
	},
	{
		id: 1005,
		name: "Elena Petrova",
		imageUrl: null,
		batch: "S1 2024",
		stintType: "recurser",
	},
	{
		id: 1006,
		name: "Fatima Al-Hassan",
		imageUrl: null,
		batch: "W1 2025",
		stintType: "resident",
	},
	{
		id: 1007,
		name: "Gabriel Santos",
		imageUrl: null,
		batch: "F1 2024",
		stintType: "recurser",
	},
	{
		id: 1008,
		name: "Hannah Park",
		imageUrl: null,
		batch: "S2 2024",
		stintType: "recurser",
	},
]

function PersonCard({
	name,
	imageUrl,
	batch,
	stintType,
	onPress,
}: {
	name: string
	imageUrl: string | null
	batch: string | null
	stintType: string | null
	onPress: () => void
}) {
	return (
		<Pressable
			className="flex-row items-center gap-3 rounded-xl bg-card px-4 py-3.5"
			onPress={onPress}
		>
			<View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-inset">
				{imageUrl ? (
					<Image source={{ uri: imageUrl }} className="h-full w-full" />
				) : (
					<Text className="text-sm font-semibold text-primary">
						{getInitials(name)}
					</Text>
				)}
			</View>
			<View className="flex-1 gap-0.5">
				<Text className="text-[15px] font-medium">{name}</Text>
				<Text className="text-xs text-text-tertiary">
					{getSubtitle(batch, stintType)}
				</Text>
			</View>
			<ChevronRight size={20} color="#475569" />
		</Pressable>
	)
}

function ScopeChip({
	label,
	active,
	onPress,
}: {
	label: string
	active: boolean
	onPress: () => void
}) {
	return (
		<Pressable
			className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-1.5 ${
				active ? "border-cyan/30 bg-cyan/10" : "border-border bg-card"
			}`}
			onPress={onPress}
		>
			{active && <View className="h-1.5 w-1.5 rounded-full bg-cyan" />}
			<Text
				className={`text-xs font-medium ${active ? "text-primary" : "text-text-secondary"}`}
			>
				{label}
			</Text>
		</Pressable>
	)
}

type Scope = "current" | "overlap" | "ngw"

export default function DemoDirectoryScreen() {
	const router = useRouter()
	const [query, setQuery] = useState("")
	const [scope, setScope] = useState<Scope | undefined>()

	const filtered = query
		? PEOPLE.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
		: PEOPLE

	return (
		<FlatList
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4"
			data={filtered}
			keyExtractor={(item) => String(item.id)}
			keyboardShouldPersistTaps="handled"
			ListHeaderComponent={
				<View className="gap-5 pb-2">
					<View className="gap-1">
						<Text className="text-sm text-text-tertiary">
							Search the RC community
						</Text>
						<Text className="text-2xl font-semibold">Directory</Text>
					</View>

					<View className="flex-row items-center gap-2 rounded-[10px] border border-border bg-card px-3.5 py-2.5">
						<Search size={18} color="#64748B" />
						<TextInput
							placeholder="Search by name, interests..."
							placeholderTextColor="#64748B"
							value={query}
							onChangeText={setQuery}
							className="flex-1 text-sm text-foreground"
							returnKeyType="search"
						/>
					</View>

					<View className="flex-row gap-2">
						{SCOPES.map((s) => (
							<ScopeChip
								key={s.value}
								label={s.label}
								active={scope === s.value}
								onPress={() =>
									setScope(scope === s.value ? undefined : s.value)
								}
							/>
						))}
					</View>
				</View>
			}
			renderItem={({ item }) => (
				<View className="pb-2.5">
					<PersonCard
						name={item.name}
						imageUrl={item.imageUrl}
						batch={item.batch}
						stintType={item.stintType}
						onPress={() => router.push(`/(demo)/member/${item.id}`)}
					/>
				</View>
			)}
			ListEmptyComponent={
				<View className="items-center gap-3 py-20">
					<Search size={48} color="#475569" />
					<Text className="text-sm text-text-tertiary">No results found</Text>
				</View>
			}
		/>
	)
}
