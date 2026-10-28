import { getSubtitle, Text, useThemeColors } from "@batchmate/ui"
import { ChevronRight } from "lucide-react-native"
import type { ReactNode } from "react"
import { Pressable, View } from "react-native"
import { Avatar } from "./avatar"

export function PersonCard({
	name,
	imageUrl,
	batch,
	stintType,
	badge,
	onPress,
}: {
	name: string
	imageUrl: string | null
	batch: string | null
	stintType?: string | null
	badge?: ReactNode
	onPress: () => void
}) {
	const c = useThemeColors()
	return (
		<Pressable
			className="flex-row items-center gap-3.5 rounded-xl bg-card px-4 py-3"
			onPress={onPress}
		>
			<Avatar imageUrl={imageUrl} name={name} size="md" />
			<View className="flex-1 gap-1">
				<Text className="text-[15px] font-medium">{name}</Text>
				<Text className="text-xs text-text-tertiary">
					{getSubtitle(batch, stintType ?? null)}
				</Text>
			</View>
			{badge}
			<ChevronRight size={20} color={c.textMuted} />
		</Pressable>
	)
}
