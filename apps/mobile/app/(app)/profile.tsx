import { Text } from "@batchmate/ui"
import { useRouter } from "expo-router"
import { Image, Linking, Pressable, ScrollView, View } from "react-native"
import {
	ChevronLeft,
	User,
	Mail,
	Hash,
	Github,
	Linkedin,
	Twitter,
	Globe,
	ExternalLink,
	LogOut,
} from "lucide-react-native"
import { signOut, useSession } from "../../src/lib/auth"

function InfoRow({
	icon: Icon,
	label,
	value,
}: { icon: typeof Mail; label: string; value?: string | null }) {
	return (
		<View className="flex-row items-center gap-3 px-4 py-3.5">
			<Icon size={18} color="#64748B" />
			<View className="flex-1 gap-0.5">
				<Text className="text-xs text-text-tertiary">{label}</Text>
				<Text className="font-mono text-sm font-medium">{value || "—"}</Text>
			</View>
		</View>
	)
}

function SocialRow({
	icon: Icon,
	label,
	value,
	href,
}: {
	icon: typeof Github
	label: string
	value?: string | null
	href?: string
}) {
	return (
		<Pressable
			className="flex-row items-center gap-3 px-4 py-3.5"
			onPress={href && value ? () => Linking.openURL(href) : undefined}
		>
			<Icon size={18} color="#64748B" />
			<View className="flex-1 gap-0.5">
				<Text className="text-xs text-text-tertiary">{label}</Text>
				<Text className="font-mono text-sm font-medium text-primary">
					{value || "—"}
				</Text>
			</View>
			{value && <ExternalLink size={16} color="#475569" />}
		</Pressable>
	)
}

export default function ProfileScreen() {
	const router = useRouter()
	const { data: session } = useSession()
	const user = session?.user as
		| (Record<string, string | null | undefined> & {
				name?: string
				email?: string
				image?: string
				rcId?: string
				github?: string
				twitter?: string
				linkedin?: string
				personalSiteUrl?: string
				batch?: string
		  })
		| undefined

	async function handleSignOut() {
		await signOut()
		router.replace("/(auth)/login")
	}

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-7"
		>
			{/* Header */}
			<View className="flex-row items-center justify-between">
				<Pressable
					className="flex-row items-center gap-1.5"
					onPress={() => router.back()}
				>
					<ChevronLeft size={20} color="#94A3B8" />
					<Text className="text-sm font-medium text-text-secondary">Back</Text>
				</Pressable>
				<Text className="text-[17px] font-semibold">Profile</Text>
				<Pressable
					onPress={() =>
						Linking.openURL("https://www.recurse.com/settings/general")
					}
				>
					<Text className="text-sm font-medium text-primary">Edit</Text>
				</Pressable>
			</View>

			{/* Avatar */}
			<View className="items-center gap-3">
				<View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-card">
					{user?.image ? (
						<Image
							source={{ uri: user.image }}
							className="h-full w-full"
						/>
					) : (
						<User size={44} color="#22D3EE" />
					)}
				</View>
				<Text className="text-[22px] font-semibold">{user?.name}</Text>
				<View className="flex-row items-center gap-1.5">
					<View className="h-2 w-2 rounded-full bg-cyan" />
					<Text className="font-mono text-[13px] font-medium text-primary">
						{user?.batch ?? "Recurser"}
					</Text>
				</View>
			</View>

			{/* Contact */}
			<View className="gap-3">
				<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
					CONTACT
				</Text>
				<View className="overflow-hidden rounded-xl bg-card">
					<InfoRow icon={Mail} label="Email" value={user?.email} />
					<View className="h-px bg-surface-inset" />
					<InfoRow icon={Hash} label="Recurse ID" value={user?.rcId} />
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
						value={user?.github}
						href={
							user?.github
								? `https://github.com/${user.github}`
								: undefined
						}
					/>
					<View className="h-px bg-surface-inset" />
					<SocialRow
						icon={Linkedin}
						label="LinkedIn"
						value={user?.linkedin}
						href={
							user?.linkedin
								? `https://linkedin.com/in/${user.linkedin}`
								: undefined
						}
					/>
					<View className="h-px bg-surface-inset" />
					<SocialRow
						icon={Twitter}
						label="Twitter"
						value={user?.twitter}
						href={
							user?.twitter
								? `https://twitter.com/${user.twitter}`
								: undefined
						}
					/>
					<View className="h-px bg-surface-inset" />
					<SocialRow
						icon={Globe}
						label="Website"
						value={user?.personalSiteUrl}
						href={user?.personalSiteUrl ?? undefined}
					/>
				</View>
			</View>

			{/* Sign Out */}
			<Pressable
				className="flex-row items-center justify-center gap-2 rounded-xl border border-cyan/20 bg-card px-4 py-3"
				onPress={handleSignOut}
			>
				<LogOut size={18} color="#94A3B8" />
				<Text className="text-sm font-medium text-text-secondary">
					Sign Out
				</Text>
			</Pressable>
		</ScrollView>
	)
}
