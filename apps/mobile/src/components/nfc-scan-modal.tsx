import { cn, Text } from "@batchmate/ui"
import { Check, Nfc, X } from "lucide-react-native"
import { useEffect, useRef } from "react"
import { Animated, Easing, Modal, Pressable, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export type NfcPrompt = {
	// What the tap is for, e.g. "Write tag" or "Identify SKU".
	reason: string
	detail?: string
} & ({ status: "waiting" } | { status: "success" | "error"; message: string })

// Full-screen prompt for one NFC operation: waiting for a tag, then the
// outcome. On iOS the system NFC sheet appears on top while waiting; on
// Android this is the only UI.
export function NfcScanModal({
	prompt,
	onCancel,
	onDone,
}: {
	prompt: NfcPrompt | null
	onCancel: () => void
	onDone: () => void
}) {
	const insets = useSafeAreaInsets()
	const pulse = useRef(new Animated.Value(0)).current
	const waiting = prompt?.status === "waiting"

	useEffect(() => {
		if (!waiting) return
		const loop = Animated.loop(
			Animated.timing(pulse, {
				toValue: 1,
				duration: 1600,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}),
		)
		loop.start()
		return () => {
			loop.stop()
			pulse.setValue(0)
		}
	}, [waiting, pulse])

	const failed = prompt?.status === "error"

	return (
		<Modal
			visible={prompt !== null}
			animationType="fade"
			statusBarTranslucent
			navigationBarTranslucent
			onRequestClose={waiting ? onCancel : onDone}
		>
			<View
				className="flex-1 items-center justify-between bg-background px-8"
				style={{
					paddingTop: insets.top + 48,
					paddingBottom: insets.bottom + 32,
				}}
			>
				<View className="items-center gap-2">
					<Text className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
						{prompt?.reason}
					</Text>
					{prompt?.detail && (
						<Text className="text-center text-base text-text-secondary">
							{prompt.detail}
						</Text>
					)}
				</View>

				<View className="items-center gap-10">
					<View className="h-56 w-56 items-center justify-center">
						{waiting && (
							<Animated.View
								className="absolute h-56 w-56 rounded-full border-2 border-cyan"
								style={{
									opacity: pulse.interpolate({
										inputRange: [0, 1],
										outputRange: [0.6, 0],
									}),
									transform: [
										{
											scale: pulse.interpolate({
												inputRange: [0, 1],
												outputRange: [0.6, 1.15],
											}),
										},
									],
								}}
							/>
						)}
						<View
							className={cn(
								"h-40 w-40 items-center justify-center rounded-full",
								failed ? "bg-destructive/10" : "bg-cyan/10",
							)}
						>
							{waiting ? (
								<Nfc size={88} color="#22D3EE" strokeWidth={1.5} />
							) : failed ? (
								<X size={88} color="#F87171" strokeWidth={1.75} />
							) : (
								<Check size={88} color="#22D3EE" strokeWidth={1.75} />
							)}
						</View>
					</View>
					<Text
						className={cn(
							"text-center font-semibold",
							waiting ? "text-2xl" : "text-xl",
							failed && "text-[#F87171]",
						)}
					>
						{prompt?.status === "waiting"
							? "Approach an NFC tag"
							: prompt?.message}
					</Text>
				</View>

				{waiting ? (
					<Pressable
						className="h-12 w-full items-center justify-center rounded-md border border-primary/40 bg-surface-inset"
						onPress={onCancel}
					>
						<Text className="text-sm font-semibold text-primary">Cancel</Text>
					</Pressable>
				) : (
					<Pressable
						className="h-12 w-full items-center justify-center rounded-md bg-cyan"
						onPress={onDone}
					>
						<Text className="text-sm font-semibold text-background">Done</Text>
					</Pressable>
				)}
			</View>
		</Modal>
	)
}
