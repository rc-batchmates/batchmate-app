import { InfoRow, SocialRow, Text } from "@batchmate/ui"
import { useQuery } from "@tanstack/react-query"
import { useLocalSearchParams, useRouter } from "expo-router"
import {
	ChevronLeft,
	Github,
	Globe,
	Hash,
	Linkedin,
	Mail,
	Twitter,
	User,
} from "lucide-react-native"
import { Image, Pressable, ScrollView, View } from "react-native"
import { api } from "../../../src/lib/api"

export default function MemberProfileScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const router = useRouter()
	const {
		data: member,
		isLoading,
		error,
	} = useQuery(api.memberProfile.queryOptions({ input: { id: Number(id) } }))

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Text className="text-sm text-text-tertiary">Loading...</Text>
			</View>
		)
	}

	if (error || !member) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Text className="text-sm text-destructive">Member not found</Text>
			</View>
		)
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
				<View className="w-12" />
			</View>

			{/* Avatar */}
			<View className="items-center gap-3">
				<View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-card">
					{member.imageUrl ? (
						<Image
							source={{ uri: member.imageUrl }}
							className="h-full w-full"
						/>
					) : (
						<User size={44} color="#22D3EE" />
					)}
				</View>
				<Text className="text-[22px] font-semibold">{member.name}</Text>
				{member.pronouns && (
					<Text className="text-sm text-text-tertiary">{member.pronouns}</Text>
				)}
				<View className="flex-row items-center gap-1.5">
					<View className="h-2 w-2 rounded-full bg-cyan" />
					<Text className="font-mono text-[13px] font-medium text-primary">
						{member.batch ?? "Recurser"}
					</Text>
				</View>
			</View>

			{/* Bio */}
			{(member.bio || member.duringRc) && (
				<View className="gap-3">
					<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
						ABOUT
					</Text>
					<View className="overflow-hidden rounded-xl bg-card px-4 py-3.5">
						<Text className="text-sm leading-relaxed text-text-secondary">
							{member.duringRc || member.bio}
						</Text>
					</View>
				</View>
			)}

			{/* Contact */}
			<View className="gap-3">
				<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
					CONTACT
				</Text>
				<View className="overflow-hidden rounded-xl bg-card">
					<InfoRow icon={Mail} label="Email" value={member.email} />
					<View className="h-px bg-surface-inset" />
					<InfoRow icon={Hash} label="Recurse ID" value={String(member.id)} />
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
						value={member.github}
						href={
							member.github ? `https://github.com/${member.github}` : undefined
						}
					/>
					<View className="h-px bg-surface-inset" />
					<SocialRow
						icon={Linkedin}
						label="LinkedIn"
						value={member.linkedin}
						href={
							member.linkedin
								? `https://linkedin.com/in/${member.linkedin}`
								: undefined
						}
					/>
					<View className="h-px bg-surface-inset" />
					<SocialRow
						icon={Twitter}
						label="Twitter"
						value={member.twitter}
						href={
							member.twitter
								? `https://twitter.com/${member.twitter}`
								: undefined
						}
					/>
					<View className="h-px bg-surface-inset" />
					<SocialRow
						icon={Globe}
						label="Website"
						value={member.personalSiteUrl}
						href={member.personalSiteUrl ?? undefined}
					/>
				</View>
			</View>
		</ScrollView>
	)
}
