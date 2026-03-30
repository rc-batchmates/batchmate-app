import "../global.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import { Slot } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-css/components/react-native-safe-area-context"

const queryClient = new QueryClient()

export default function RootLayout() {
	useFonts({
		CommitMono: require("../assets/fonts/CommitMono-400-Regular.otf"),
		"CommitMono-Bold": require("../assets/fonts/CommitMono-700-Regular.otf"),
	})

	return (
		<SafeAreaProvider>
			<QueryClientProvider client={queryClient}>
				<StatusBar style="light" />
				<Slot />
			</QueryClientProvider>
		</SafeAreaProvider>
	)
}
