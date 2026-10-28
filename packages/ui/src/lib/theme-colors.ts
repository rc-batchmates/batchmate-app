import { useSyncExternalStore } from "react"
import { Platform, useColorScheme } from "react-native"

// Mirrors the CSS palettes in apps/mobile/global.css and apps/web/src/index.css
// for props that take a raw color string (icon `color`, `placeholderTextColor`,
// navigator options).
const dark = {
	background: "#0A0F1C",
	surface: "#0F172A",
	card: "#1E293B",
	border: "#1E293B",
	foreground: "#FFFFFF",
	primary: "#22D3EE",
	primaryForeground: "#0A0F1C",
	textSecondary: "#94A3B8",
	textTertiary: "#64748B",
	textMuted: "#475569",
	danger: "#F87171",
	moon: "#A5B4FC",
}

const light: typeof dark = {
	background: "#F8FAFC",
	surface: "#FFFFFF",
	card: "#FFFFFF",
	border: "#E2E8F0",
	foreground: "#0F172A",
	primary: "#0A6680",
	primaryForeground: "#FFFFFF",
	textSecondary: "#475569",
	textTertiary: "#556377",
	textMuted: "#606F85",
	danger: "#B91C1C",
	moon: "#4F46E5",
}

export type ThemeColors = typeof dark

// On web the theme is driven by a .light class on <html> (see
// apps/web/index.html), so watch that rather than the browser's scheme.
function subscribeWebTheme(onChange: () => void) {
	if (Platform.OS !== "web") return () => {}
	const observer = new MutationObserver(onChange)
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	})
	return () => observer.disconnect()
}

function isWebLight() {
	return (
		Platform.OS === "web" &&
		document.documentElement.classList.contains("light")
	)
}

export function useThemeColors(): ThemeColors {
	const scheme = useColorScheme()
	const webLight = useSyncExternalStore(
		subscribeWebTheme,
		isWebLight,
		() => false,
	)
	if (Platform.OS === "web") return webLight ? light : dark
	return scheme === "light" ? light : dark
}
