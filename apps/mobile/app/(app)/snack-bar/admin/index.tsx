import { Text, useThemeColors } from "@batchmate/ui"
import { type Href, useRouter } from "expo-router"
import { Download, Nfc, Users } from "lucide-react-native"
import type { ComponentType } from "react"
import { Pressable, ScrollView, View } from "react-native"
import { BackHeader } from "../../../../src/components/back-header"
import { SnackBarAdminGate } from "../../../../src/components/snack-bar-admin-gate"

const SECTIONS: {
	href: Href
	title: string
	description: string
	icon: ComponentType<{ size: number; color: string }>
}[] = [
	{
		href: "/snack-bar/admin/skus",
		title: "Snacks & tags",
		description: "Add snacks, set prices, write and identify NFC tags",
		icon: Nfc,
	},
	{
		href: "/snack-bar/admin/accounts",
		title: "Accounts",
		description: "Who owes what, history, and recording payments",
		icon: Users,
	},
	{
		href: "/snack-bar/admin/export",
		title: "Export",
		description: "Download transactions as a CSV",
		icon: Download,
	},
]

export default function SnackBarAdminScreen() {
	const c = useThemeColors()
	const router = useRouter()
	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-6"
		>
			<BackHeader title="Snack Bar admin" />
			<SnackBarAdminGate>
				<View className="gap-3">
					{SECTIONS.map(({ href, title, description, icon: Icon }) => (
						<Pressable
							key={title}
							className="flex-row items-center gap-3 rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3.5"
							onPress={() => router.push(href)}
						>
							<Icon size={18} color={c.primary} />
							<View className="flex-1">
								<Text className="text-[15px] font-semibold text-primary">
									{title}
								</Text>
								<Text className="text-xs text-text-tertiary">
									{description}
								</Text>
							</View>
							<Text className="text-xs font-medium text-primary">→</Text>
						</Pressable>
					))}
				</View>
			</SnackBarAdminGate>
		</ScrollView>
	)
}
