import { redirect } from "@tanstack/react-router"
import { authClient } from "@/lib/auth"

// beforeLoad guard: send logged-out visitors to login, then back here.
export async function requireSession({
	location,
}: {
	location: { href: string }
}) {
	const { data: session } = await authClient.getSession()
	if (!session) {
		throw redirect({ to: "/login", search: { redirect: location.href } })
	}
}
