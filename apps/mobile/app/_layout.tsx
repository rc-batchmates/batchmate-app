import "../global.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import { Slot } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useWindowDimensions, View } from "react-native"
import { SafeAreaProvider } from "react-native-css/components/react-native-safe-area-context"

const queryClient = new QueryClient()

export default function RootLayout() {
	const { fontScale } = useWindowDimensions()
	useFonts({
		CommitMono: require("../assets/fonts/CommitMono-400-Regular.otf"),
		"CommitMono-Bold": require("../assets/fonts/CommitMono-700-Regular.otf"),
	})

	// iOS does not re-measure existing text when the system text size changes,
	// so remount the tree on a new fontScale. Navigation resets to the start.
	return (
		<View key={fontScale} className="flex-1 bg-background">
			<SafeAreaProvider>
				<QueryClientProvider client={queryClient}>
					<StatusBar style="light" />
					<Slot />
				</QueryClientProvider>
			</SafeAreaProvider>
		</View>
	)
}
