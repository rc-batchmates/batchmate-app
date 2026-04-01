import type { ComponentType } from "react"
import { useState } from "react"
import { Platform, Pressable, View } from "react-native"
import { Text } from "./text"

export function InfoRow({
	icon: Icon,
	label,
	value,
}: {
	icon: ComponentType<{ size: number; color: string }>
	label: string
	value?: string | null
}) {
	const [copied, setCopied] = useState(false)

	async function handleCopy() {
		if (!value) return
		if (Platform.OS === "web") {
			navigator.clipboard.writeText(value)
		} else {
			const Clipboard = await import("expo-clipboard")
			await Clipboard.setStringAsync(value)
		}
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}

	return (
		<Pressable
			onPress={handleCopy}
			disabled={!value}
			className="flex-row items-center gap-3 px-4 py-3.5"
		>
			<Icon size={18} color="#64748B" />
			<View className="flex-1 gap-0.5">
				<Text className="text-xs text-text-tertiary">{label}</Text>
				<Text className="font-mono text-sm font-medium">{value || "—"}</Text>
			</View>
			{value && (
				<Text className="text-xs text-text-tertiary">
					{copied ? "Copied!" : "Copy"}
				</Text>
			)}
		</Pressable>
	)
}
