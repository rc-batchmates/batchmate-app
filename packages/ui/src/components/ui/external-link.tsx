import type { ReactNode } from "react"
import { Linking, Platform, Pressable } from "react-native"

export function ExternalLink({
	href,
	children,
	className,
}: {
	href: string
	children: ReactNode
	className?: string
}) {
	if (Platform.OS === "web") {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={className}
				style={{ textDecoration: "none" }}
			>
				{children}
			</a>
		)
	}

	return (
		<Pressable className={className} onPress={() => Linking.openURL(href)}>
			{children}
		</Pressable>
	)
}
