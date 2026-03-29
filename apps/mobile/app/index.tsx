import { Redirect } from "expo-router"
import { useSession } from "../src/lib/auth"

export default function Index() {
	const { data: session, isPending } = useSession()

	if (isPending) return null

	if (session) {
		return <Redirect href="/(app)" />
	}

	return <Redirect href="/(auth)/login" />
}
