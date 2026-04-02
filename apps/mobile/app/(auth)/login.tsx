import { LoginForm } from "@batchmate/ui"
import { useRouter } from "expo-router"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { signIn } from "../../src/lib/auth"
import { enterDemoMode } from "../../src/lib/demo"

const TAPS_REQUIRED = 5

export default function LoginScreen() {
	const router = useRouter()

	const [demoTaps, setDemoTaps] = useState(0)

	function handleLogoTap() {
		const next = demoTaps + 1
		setDemoTaps(next)
		if (next >= TAPS_REQUIRED) {
			enterDemoMode()
			router.replace("/(demo)")
		}
	}

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-background"
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView
				className="flex-1"
				contentContainerClassName="flex-1 justify-center"
				keyboardShouldPersistTaps="handled"
			>
				<LoginForm
					logoSource={require("../../assets/rc_octopus_cyan.png")}
					onLogoPress={handleLogoTap}
					onSubmit={async () => {
						await signIn.social({
							provider: "recurse",
							callbackURL: "/(app)",
						})
						router.replace("/(app)")
					}}
				/>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
