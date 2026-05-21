import {
	AVATAR_SIZE_PX,
	type AvatarSize,
	getInitials,
	Text,
} from "@batchmate/ui"
import { User } from "lucide-react-native"
import { Image, View } from "react-native"

const RADIUS_FOR_SIZE: Record<AvatarSize, number> = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
}

const INITIALS_TEXT_CLASS: Record<AvatarSize, string> = {
	sm: "text-xs",
	md: "text-lg",
	lg: "text-2xl",
	xl: "text-4xl",
}

const ICON_SIZE: Record<AvatarSize, number> = {
	sm: 16,
	md: 28,
	lg: 44,
	xl: 72,
}

export function Avatar({
	imageUrl,
	name,
	size = "sm",
	fallback = "initials",
}: {
	imageUrl: string | null | undefined
	name: string
	size?: AvatarSize
	fallback?: "initials" | "icon"
}) {
	const px = AVATAR_SIZE_PX[size]
	const radius = RADIUS_FOR_SIZE[size]
	return (
		<View
			style={{ width: px, height: px, borderRadius: radius }}
			className="items-center justify-center overflow-hidden bg-surface-inset"
		>
			{imageUrl ? (
				<Image
					source={{ uri: imageUrl }}
					style={{ width: px, height: px, borderRadius: radius }}
					resizeMode="cover"
				/>
			) : fallback === "icon" ? (
				<User size={ICON_SIZE[size]} color="#22D3EE" />
			) : (
				<Text
					className={`${INITIALS_TEXT_CLASS[size]} font-semibold text-primary`}
				>
					{getInitials(name)}
				</Text>
			)}
		</View>
	)
}
