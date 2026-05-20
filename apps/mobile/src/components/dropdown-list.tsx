import { Text } from "@batchmate/ui"
import { useState } from "react"
import { Pressable, ScrollView, TextInput, View } from "react-native"

export function DropdownList<T extends { id: number; name: string }>({
	items,
	isLoading,
	onSelect,
	activeValue,
}: {
	items: T[]
	isLoading: boolean
	onSelect: (item: T) => void
	activeValue?: string
}) {
	const [search, setSearch] = useState("")
	const filtered = items.filter((item) =>
		item.name.toLowerCase().includes(search.toLowerCase()),
	)

	return (
		<View className="mt-2 overflow-hidden rounded-lg border border-border bg-background">
			<View className="border-b border-border p-2">
				<TextInput
					placeholder="Search..."
					placeholderTextColor="#64748B"
					value={search}
					onChangeText={setSearch}
					className="rounded-md bg-card px-3 py-1.5 text-sm text-foreground"
					autoFocus
				/>
			</View>
			<ScrollView style={{ maxHeight: 192 }}>
				{isLoading && (
					<View className="px-3 py-2">
						<Text className="text-sm text-text-tertiary">Loading...</Text>
					</View>
				)}
				{!isLoading && filtered.length === 0 && (
					<View className="px-3 py-2">
						<Text className="text-sm text-text-tertiary">No results</Text>
					</View>
				)}
				{filtered.map((item) => (
					<Pressable
						key={item.id}
						onPress={() => onSelect(item)}
						className="px-3 py-2"
					>
						<Text
							className={`text-sm ${
								activeValue === item.name ? "text-primary" : "text-foreground"
							}`}
						>
							{item.name}
						</Text>
					</Pressable>
				))}
			</ScrollView>
		</View>
	)
}
