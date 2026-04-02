import { Stack } from "expo-router"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function DemoLayout() {
	const insets = useSafeAreaInsets()

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="member/[id]" />
			</Stack>
		</View>
	)
}
