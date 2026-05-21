import { getSubtitle, Text } from "@batchmate/ui"
import { User, X } from "lucide-react-native"
import { Image, Modal, Pressable, View } from "react-native"

export function PhotoPeek({
	visible,
	onClose,
	name,
	imageUrl,
	batch,
	stintType,
}: {
	visible: boolean
	onClose: () => void
	name: string
	imageUrl: string | null
	batch: string | null
	stintType?: string | null
}) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
			statusBarTranslucent
		>
			<Pressable
				onPress={onClose}
				className="flex-1 items-center justify-center bg-black/90 px-6"
			>
				<View className="absolute top-14 right-6">
					<Pressable
						onPress={onClose}
						className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
						hitSlop={8}
					>
						<X size={22} color="#FFFFFF" />
					</Pressable>
				</View>
				<View className="aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl bg-card">
					{imageUrl ? (
						<Image
							source={{ uri: imageUrl }}
							style={{ width: "100%", height: "100%", borderRadius: 24 }}
							resizeMode="cover"
						/>
					) : (
						<User size={120} color="#22D3EE" />
					)}
				</View>
				<View className="mt-6 items-center gap-1.5">
					<Text className="text-center text-2xl font-semibold text-white">
						{name}
					</Text>
					<Text className="text-center font-mono text-sm text-text-tertiary">
						{getSubtitle(batch, stintType ?? null)}
					</Text>
				</View>
			</Pressable>
		</Modal>
	)
}
