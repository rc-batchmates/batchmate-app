import { Text } from "@batchmate/ui"
import { Pressable, View } from "react-native"

export function ScopeChip({
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
