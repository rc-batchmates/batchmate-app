import "../global.css"

import { useThemeColors } from "@batchmate/ui"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import { Slot } from "expo-router"
import { StatusBar } from "expo-status-bar"
import * as SystemUI from "expo-system-ui"
import { useEffect } from "react"
import { View } from "react-native"
import { SafeAreaProvider } from "react-native-css/components/react-native-safe-area-context"
import { applyStoredThemePreference } from "../src/lib/theme-preference"

applyStoredThemePreference()

const queryClient = new QueryClient()

export default function RootLayout() {
	const c = useThemeColors()

	// Keep the native root view in step with the theme so screen transitions
	// and keyboard gaps never show the wrong colour behind the app.
	useEffect(() => {
		SystemUI.setBackgroundColorAsync(c.background)
	}, [c.background])

	useFonts({
		CommitMono: require("../assets/fonts/CommitMono-400-Regular.otf"),
		"CommitMono-Bold": require("../assets/fonts/CommitMono-700-Regular.otf"),
	})

	return (
		<View className="flex-1 bg-background">
			<SafeAreaProvider>
				<QueryClientProvider client={queryClient}>
					<StatusBar style="auto" />
					<Slot />
				</QueryClientProvider>
			</SafeAreaProvider>
		</View>
	)
}
