import { LoginForm } from "@batchmate/ui"
import { useRouter } from "expo-router"
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { signIn } from "../../src/lib/auth"

export default function LoginScreen() {
	const router = useRouter()

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
