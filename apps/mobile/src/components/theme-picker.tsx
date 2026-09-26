import { Text } from "@batchmate/ui"
import { Pressable, View } from "react-native"
import {
	type ThemePreference,
	useThemePreference,
} from "../lib/theme-preference"

const OPTIONS: { value: ThemePreference; label: string }[] = [
	{ value: "system", label: "System" },
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
]

export function ThemePicker() {
	const [pref, setPref] = useThemePreference()

	return (
		<View className="gap-3">
			<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
				APPEARANCE
			</Text>
			<View className="flex-row gap-1 rounded-xl bg-card p-1">
				{OPTIONS.map((o) => (
					<Pressable
						key={o.value}
						onPress={() => setPref(o.value)}
						className={`flex-1 items-center rounded-lg py-2 ${
							pref === o.value ? "bg-cyan/15" : ""
						}`}
					>
						<Text
							className={`text-sm font-medium ${
								pref === o.value ? "text-primary" : "text-text-secondary"
							}`}
						>
							{o.label}
						</Text>
					</Pressable>
				))}
			</View>
		</View>
	)
}
