import { LoginForm } from "@batchmate/ui"
import { createFileRoute } from "@tanstack/react-router"
import { AuthLayout } from "@/components/auth-layout"
import { signIn } from "@/lib/auth"

export const Route = createFileRoute("/_auth/login")({
	component: LoginPage,
})

function LoginPage() {
	return (
		<AuthLayout>
			<LoginForm
				logoSource="/rc_octopus_cyan.png"
				onSubmit={async () => {
					await signIn.social({ provider: "recurse", callbackURL: "/" })
				}}
			/>
		</AuthLayout>
	)
}
