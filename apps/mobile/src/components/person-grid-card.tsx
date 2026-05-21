import { getSubtitle, Text } from "@batchmate/ui"
import type { ReactNode } from "react"
import { Pressable, View } from "react-native"
import { Avatar } from "./avatar"

export function PersonGridCard({
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
			className="items-center gap-2.5 rounded-2xl bg-card p-3"
			onPress={onPress}
		>
			<Avatar imageUrl={imageUrl} name={name} size="xl" />
			<View className="w-full items-center gap-1">
				<Text className="text-center text-sm font-medium" numberOfLines={1}>
					{name}
				</Text>
				<Text
					className="text-center text-[11px] text-text-tertiary"
					numberOfLines={1}
				>
					{getSubtitle(batch, stintType ?? null)}
				</Text>
				{badge}
			</View>
		</Pressable>
	)
}
