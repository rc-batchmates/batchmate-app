import { useThemeColors } from "@batchmate/ui"
import { Tabs } from "expo-router"
import { House, Megaphone, Search, User, Users } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function TabsLayout() {
	const c = useThemeColors()
	const insets = useSafeAreaInsets()

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: c.surface,
					borderTopColor: c.border,
					borderTopWidth: 1,
					paddingBottom: insets.bottom,
					height: 56 + insets.bottom,
				},
				tabBarActiveTintColor: c.primary,
				tabBarInactiveTintColor: c.textTertiary,
				tabBarLabelStyle: {
					fontFamily: "Inter",
					fontSize: 10,
					fontWeight: "500",
				},
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
				name="presentations"
				options={{
					title: "Talks",
					tabBarIcon: ({ color, size }) => (
						<Megaphone size={size} color={color} />
					),
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
