import type { ComponentType } from "react"
import { useState } from "react"
import { Linking, Platform, Pressable, View } from "react-native"
import { Text } from "./text"

export function InfoRow({
	icon: Icon,
	label,
	value,
	mailto,
}: {
	icon: ComponentType<{ size: number; color: string }>
	label: string
	value?: string | null
	mailto?: boolean
}) {
	const [copied, setCopied] = useState(false)

	async function copyValue() {
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

	async function handlePress() {
		if (!value) return
		if (mailto) {
			const url = `mailto:${value}`
			if (Platform.OS === "web") {
				window.open(url, "_self")
				return
			}
			const supported = await Linking.canOpenURL(url)
			if (supported) {
				await Linking.openURL(url)
				return
			}
		}
		await copyValue()
	}

	return (
		<Pressable
			onPress={handlePress}
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
					{copied ? "Copied!" : mailto ? "Send" : "Copy"}
				</Text>
			)}
		</Pressable>
	)
}
