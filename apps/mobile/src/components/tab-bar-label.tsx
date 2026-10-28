import { Text } from "@batchmate/ui"
import { useWindowDimensions } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

// Tab labels follow the system text size, up to a cap that still fits five
// tabs across a phone.
const MAX_LABEL_SCALE = 1.3

export function TabBarLabel({
	color,
	children,
}: {
	color: string
	children: string
}) {
	return (
		<Text
			className="text-center text-[10px] font-medium"
			style={{ color, fontFamily: "Inter" }}
			numberOfLines={1}
			maxFontSizeMultiplier={MAX_LABEL_SCALE}
		>
			{children}
		</Text>
	)
}

export function useTabBarHeight() {
	const insets = useSafeAreaInsets()
	const { fontScale } = useWindowDimensions()
	const labelScale = Math.min(Math.max(fontScale, 1), MAX_LABEL_SCALE)
	// Grow by the extra line height the scaled label needs.
	return 56 + Math.ceil(13 * (labelScale - 1)) + insets.bottom
}
