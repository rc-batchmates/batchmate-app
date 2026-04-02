import { ExternalLink, InfoRow, SocialRow, Text } from "@batchmate/ui"
import { useRouter } from "expo-router"
import {
	Github,
	Globe,
	Hash,
	Linkedin,
	LogOut,
	Mail,
	Twitter,
	User,
} from "lucide-react-native"
import { Pressable, ScrollView, View } from "react-native"
import { exitDemoMode } from "../../../src/lib/demo"

export default function DemoProfileScreen() {
	const router = useRouter()

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-7"
		>
			{/* Header */}
			<View className="flex-row items-center justify-between">
				<Text className="text-[17px] font-semibold">Profile</Text>
				<ExternalLink href="https://www.recurse.com/settings/general">
					<Text className="text-sm font-medium text-primary">Edit</Text>
				</ExternalLink>
			</View>

			{/* Avatar */}
			<View className="items-center gap-3">
				<View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-card">
					<User size={44} color="#22D3EE" />
				</View>
				<Text className="text-[22px] font-semibold">Demo User</Text>
				<View className="flex-row items-center gap-1.5">
					<View className="h-2 w-2 rounded-full bg-cyan" />
					<Text className="font-mono text-[13px] font-medium text-primary">
						W1 2025
					</Text>
				</View>
			</View>

			{/* Contact */}
			<View className="gap-3">
				<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
					CONTACT
				</Text>
				<View className="overflow-hidden rounded-xl bg-card">
					<InfoRow icon={Mail} label="Email" value="demo@example.com" />
					<View className="h-px bg-surface-inset" />
					<InfoRow icon={Hash} label="Recurse ID" value="00000" />
				</View>
			</View>

			{/* Social */}
			<View className="gap-3">
				<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
					SOCIAL
				</Text>
				<View className="overflow-hidden rounded-xl bg-card">
					<SocialRow
						icon={Github}
						label="GitHub"
						value="demouser"
						href="https://github.com/demouser"
					/>
					<View className="h-px bg-surface-inset" />
					<SocialRow icon={Linkedin} label="LinkedIn" value={null} />
					<View className="h-px bg-surface-inset" />
					<SocialRow icon={Twitter} label="Twitter" value={null} />
					<View className="h-px bg-surface-inset" />
					<SocialRow icon={Globe} label="Website" value={null} />
				</View>
			</View>

			{/* Sign Out */}
			<Pressable
				className="flex-row items-center justify-center gap-2 rounded-xl border border-cyan/20 bg-card px-4 py-3"
				onPress={() => {
					exitDemoMode()
					router.replace("/(auth)/login")
				}}
			>
				<LogOut size={18} color="#94A3B8" />
				<Text className="text-sm font-medium text-text-secondary">
					Sign Out
				</Text>
			</Pressable>
		</ScrollView>
	)
}
