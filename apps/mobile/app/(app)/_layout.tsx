import { Redirect, Stack } from "expo-router"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSession } from "../../src/lib/auth"

export default function AppLayout() {
	const { data: session, isPending } = useSession()
	const insets = useSafeAreaInsets()

	if (isPending) return null

	if (!session) {
		return <Redirect href="/(auth)/login" />
	}

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="member/[id]" />
			</Stack>
		</View>
	)
}
