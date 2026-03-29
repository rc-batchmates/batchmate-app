import { Redirect, Stack } from "expo-router"
import { useSession } from "../../src/lib/auth"

export default function AuthLayout() {
	const { data: session, isPending } = useSession()

	if (isPending) return null

	if (session) {
		return <Redirect href="/(app)" />
	}

	return <Stack screenOptions={{ headerShown: false }} />
}
