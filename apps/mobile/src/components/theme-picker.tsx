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
			<View
				accessibilityRole="radiogroup"
				className="flex-row gap-1 rounded-xl bg-card p-1"
			>
				{OPTIONS.map((o) => {
					const selected = pref === o.value
					return (
						<Pressable
							key={o.value}
							onPress={() => setPref(o.value)}
							accessibilityRole="radio"
							accessibilityLabel={`${o.label} appearance`}
							accessibilityState={{ selected, checked: selected }}
							className={`flex-1 items-center rounded-lg py-2 ${
								selected ? "bg-cyan/15" : ""
							}`}
						>
							<Text
								className={`text-sm font-medium ${
									selected ? "text-primary" : "text-text-secondary"
								}`}
							>
								{o.label}
							</Text>
						</Pressable>
					)
				})}
			</View>
		</View>
	)
}
