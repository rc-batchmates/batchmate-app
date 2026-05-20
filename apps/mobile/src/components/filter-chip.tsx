import { Text } from "@batchmate/ui"
import { ChevronDown } from "lucide-react-native"
import { Pressable } from "react-native"

export function FilterChip({
	icon: Icon,
	label,
	active,
	onPress,
}: {
	icon: React.ComponentType<{ size: number; color: string }>
	label: string
	active: boolean
	onPress: () => void
}) {
	return (
		<Pressable
			className={`flex-row items-center gap-1.5 rounded-lg border px-3 py-2 ${
				active ? "border-cyan/30 bg-cyan/10" : "border-border bg-card"
			}`}
			onPress={onPress}
		>
			<Icon size={14} color={active ? "#22D3EE" : "#94A3B8"} />
			<Text
				className={`text-[13px] font-medium ${active ? "text-primary" : "text-text-secondary"}`}
			>
				{label}
			</Text>
			<ChevronDown size={14} color={active ? "#22D3EE" : "#64748B"} />
		</Pressable>
	)
}
