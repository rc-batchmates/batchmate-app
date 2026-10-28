import { useThemeColors } from "@batchmate/ui"
import { Tabs } from "expo-router"
import { House, Search, User, Users } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
	TabBarLabel,
	useTabBarHeight,
} from "../../../src/components/tab-bar-label"

export default function DemoTabsLayout() {
	const c = useThemeColors()
	const insets = useSafeAreaInsets()
	const tabBarHeight = useTabBarHeight()

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: c.surface,
					borderTopColor: c.border,
					borderTopWidth: 1,
					paddingBottom: insets.bottom,
					height: tabBarHeight,
				},
				tabBarActiveTintColor: c.primary,
				tabBarInactiveTintColor: c.textTertiary,
				tabBarLabel: ({ color, children }) => (
					<TabBarLabel color={color}>{children}</TabBarLabel>
				),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="hub"
				options={{
					title: "Hub",
					tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="directory"
				options={{
					title: "Directory",
					tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
				}}
			/>
		</Tabs>
	)
}
