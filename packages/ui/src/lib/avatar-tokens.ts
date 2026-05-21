export const AVATAR_SIZE_PX = {
	sm: 32,
	md: 80,
	lg: 96,
	xl: 160,
} as const

export type AvatarSize = keyof typeof AVATAR_SIZE_PX

export const AVATAR_FACE_OBJECT_POSITION = "center 30%"
