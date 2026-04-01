import { ExternalLink as ExternalLinkIcon } from "lucide-react-native"
import type { ComponentType } from "react"
import { View } from "react-native"
import { ExternalLink } from "./external-link"
import { Text } from "./text"

export function SocialRow({
	icon: Icon,
	label,
	value,
	href,
}: {
	icon: ComponentType<{ size: number; color: string }>
	label: string
	value?: string | null
	href?: string
}) {
	const content = (
		<>
			<Icon size={18} color="#64748B" />
			<View className="flex-1 gap-0.5">
				<Text className="text-xs text-text-tertiary">{label}</Text>
				<Text className="font-mono text-sm font-medium text-primary">
					{value || "—"}
				</Text>
			</View>
			{value && <ExternalLinkIcon size={16} color="#475569" />}
		</>
	)

	if (href) {
		return (
			<ExternalLink
				href={href}
				className="flex flex-row items-center gap-3 px-4 py-3.5"
			>
				{content}
			</ExternalLink>
		)
	}

	return (
		<View className="flex flex-row items-center gap-3 px-4 py-3.5">
			{content}
		</View>
	)
}
