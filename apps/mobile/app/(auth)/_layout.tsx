import { View } from "react-native"
import { Redirect, Slot } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSession } from "../../src/lib/auth"

export default function AuthLayout() {
	const { data: session, isPending } = useSession()
	const insets = useSafeAreaInsets()

	if (isPending) return null

	if (session) {
		return <Redirect href="/(app)" />
	}

	return (
		<View
			className="flex-1 bg-background"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<Slot />
		</View>
	)
}
