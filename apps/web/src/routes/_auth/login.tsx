import { LoginForm } from "@batchmate/ui"
import { createFileRoute } from "@tanstack/react-router"
import { AuthLayout } from "@/components/auth-layout"
import { signIn } from "@/lib/auth"

export const Route = createFileRoute("/_auth/login")({
	component: LoginPage,
})

function LoginPage() {
	return (
		<AuthLayout
			tagline={"The next generation of recurse tooling."}
			taglineSub="Access the hub, manage your schedule & configure your rc thing — all in one place."
		>
			<LoginForm
				onSubmit={async () => {
					await signIn.social({ provider: "recurse", callbackURL: "/" })
				}}
			/>
		</AuthLayout>
	)
}
