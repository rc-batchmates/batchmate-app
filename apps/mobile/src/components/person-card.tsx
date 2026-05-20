import { getInitials, getSubtitle, Text } from "@batchmate/ui"
import { ChevronRight } from "lucide-react-native"
import type { ReactNode } from "react"
import { Image, Pressable, View } from "react-native"

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
					{getSubtitle(batch, stintType ?? null)}
				</Text>
			</View>
			{badge}
			<ChevronRight size={20} color="#475569" />
		</Pressable>
	)
}
