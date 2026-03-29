import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { authClient } from "@/lib/auth"

export const Route = createFileRoute("/_auth")({
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession()
		if (session) {
			throw redirect({ to: "/" })
		}
	},
	component: () => <Outlet />,
})
