import { Redirect, Stack } from "expo-router"
import { useSession } from "../../src/lib/auth"

export default function AppLayout() {
	const { data: session, isPending } = useSession()

	if (isPending) return null

	if (!session) {
		return <Redirect href="/(auth)/login" />
	}

	return <Stack />
}
