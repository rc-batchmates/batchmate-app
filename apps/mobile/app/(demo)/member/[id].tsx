import { InfoRow, SocialRow, Text } from "@batchmate/ui"
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
import { Pressable, ScrollView, View } from "react-native"

const MEMBERS: Record<
	string,
	{
		name: string
		pronouns: string | null
		batch: string
		email: string
		bio: string
		github: string | null
		linkedin: string | null
		twitter: string | null
		personalSiteUrl: string | null
	}
> = {
	"1001": {
		name: "Alice Zhang",
		pronouns: "she/her",
		batch: "W1 2025",
		email: "alice@example.com",
		bio: "Systems programmer interested in compilers, operating systems, and low-level performance optimization.",
		github: "alicezhang",
		linkedin: "alicezhang",
		twitter: null,
		personalSiteUrl: "https://example.com",
	},
	"1002": {
		name: "Ben Okafor",
		pronouns: "he/him",
		batch: "S2 2024",
		email: "ben@example.com",
		bio: "Full-stack developer exploring distributed systems and consensus algorithms.",
		github: "benokafor",
		linkedin: null,
		twitter: "benokafor",
		personalSiteUrl: null,
	},
	"1003": {
		name: "Carmen Reyes",
		pronouns: "she/her",
		batch: "W1 2025",
		email: "carmen@example.com",
		bio: "Graphics programmer working on real-time rendering techniques and shader development.",
		github: "carmenreyes",
		linkedin: "carmenreyes",
		twitter: null,
		personalSiteUrl: null,
	},
	"1004": {
		name: "David Kim",
		pronouns: "he/him",
		batch: "F2 2024",
		email: "david@example.com",
		bio: "Building a programming language with a focus on developer ergonomics.",
		github: "davidkim",
		linkedin: null,
		twitter: null,
		personalSiteUrl: "https://example.com",
	},
}

const DEFAULT_MEMBER = {
	name: "Demo Member",
	pronouns: "they/them",
	batch: "W1 2025",
	email: "member@example.com",
	bio: "Exploring new programming paradigms and building interesting projects.",
	github: "demomember",
	linkedin: null,
	twitter: null,
	personalSiteUrl: null,
}

export default function DemoMemberProfileScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const router = useRouter()
	const member = MEMBERS[id] ?? DEFAULT_MEMBER

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
					<User size={44} color="#22D3EE" />
				</View>
				<Text className="text-[22px] font-semibold">{member.name}</Text>
				{member.pronouns && (
					<Text className="text-sm text-text-tertiary">{member.pronouns}</Text>
				)}
				<View className="flex-row items-center gap-1.5">
					<View className="h-2 w-2 rounded-full bg-cyan" />
					<Text className="font-mono text-[13px] font-medium text-primary">
						{member.batch}
					</Text>
				</View>
			</View>

			{/* Bio */}
			<View className="gap-3">
				<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
					ABOUT
				</Text>
				<View className="overflow-hidden rounded-xl bg-card px-4 py-3.5">
					<Text className="text-sm leading-relaxed text-text-secondary">
						{member.bio}
					</Text>
				</View>
			</View>

			{/* Contact */}
			<View className="gap-3">
				<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
					CONTACT
				</Text>
				<View className="overflow-hidden rounded-xl bg-card">
					<InfoRow icon={Mail} label="Email" value={member.email} />
					<View className="h-px bg-surface-inset" />
					<InfoRow icon={Hash} label="Recurse ID" value={id} />
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
