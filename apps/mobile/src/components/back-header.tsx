import { Text, useThemeColors } from "@batchmate/ui"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { Pressable, View } from "react-native"

export function BackHeader({ title }: { title: string }) {
	const c = useThemeColors()
	const router = useRouter()
	return (
		<View className="flex-row items-center justify-between">
			<Pressable
				className="flex-row items-center gap-1.5"
				onPress={() =>
					router.canGoBack() ? router.back() : router.replace("/")
				}
			>
				<ChevronLeft size={20} color={c.textSecondary} />
				<Text className="text-sm font-medium text-text-secondary">Back</Text>
			</Pressable>
			<Text className="text-[15px] font-semibold">{title}</Text>
			<View className="w-12" />
		</View>
	)
}
