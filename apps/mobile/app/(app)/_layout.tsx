import { Redirect, Tabs } from "expo-router"
import { House, Search, User, Users } from "lucide-react-native"
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
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarStyle: {
						backgroundColor: "#0F172A",
						borderTopColor: "#1E293B",
						borderTopWidth: 1,
						paddingBottom: insets.bottom,
						height: 56 + insets.bottom,
					},
					tabBarActiveTintColor: "#22D3EE",
					tabBarInactiveTintColor: "#64748B",
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
						tabBarIcon: ({ color, size }) => (
							<House size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="hub"
					options={{
						title: "Hub",
						tabBarIcon: ({ color, size }) => (
							<Users size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="directory"
					options={{
						title: "Directory",
						tabBarIcon: ({ color, size }) => (
							<Search size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="profile"
					options={{
						title: "Profile",
						tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
					}}
				/>
				<Tabs.Screen
					name="member/[id]"
					options={{
						href: null,
					}}
				/>
			</Tabs>
		</View>
	)
}
