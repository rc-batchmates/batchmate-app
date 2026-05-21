import {
	AVATAR_FACE_OBJECT_POSITION,
	AVATAR_SIZE_PX,
	type AvatarSize,
	getInitials,
} from "@batchmate/ui"
import { User } from "lucide-react"

const RADIUS_CLASS_FOR_SIZE: Record<AvatarSize, string> = {
	sm: "rounded-lg",
	md: "rounded-xl",
	lg: "rounded-2xl",
	xl: "rounded-3xl",
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
	const radiusClass = RADIUS_CLASS_FOR_SIZE[size]
	return (
		<div
			style={{ width: px, height: px }}
			className={`flex shrink-0 items-center justify-center overflow-hidden bg-surface-inset ${radiusClass}`}
		>
			{imageUrl ? (
				<img
					src={imageUrl}
					alt=""
					loading="lazy"
					decoding="async"
					className="h-full w-full object-cover"
					style={{ objectPosition: AVATAR_FACE_OBJECT_POSITION }}
				/>
			) : fallback === "icon" ? (
				<User size={ICON_SIZE[size]} color="#22D3EE" />
			) : (
				<span
					className={`${INITIALS_TEXT_CLASS[size]} font-semibold text-cyan`}
				>
					{getInitials(name)}
				</span>
			)}
		</div>
	)
}
