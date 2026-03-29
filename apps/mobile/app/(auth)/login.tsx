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
				contentContainerClassName="flex-1 justify-center px-6 py-12"
				keyboardShouldPersistTaps="handled"
			>
				<LoginForm
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
