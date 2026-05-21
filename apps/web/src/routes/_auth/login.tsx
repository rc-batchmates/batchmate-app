import { LoginForm } from "@batchmate/ui"
import { createFileRoute } from "@tanstack/react-router"
import { AuthLayout } from "@/components/auth-layout"
import { signIn } from "@/lib/auth"

export const Route = createFileRoute("/_auth/login")({
	component: LoginPage,
})

const APP_STORE_URL =
	"https://apps.apple.com/us/app/batchmate-recurse-companion/id6761288712"
const PLAY_STORE_URL =
	"https://play.google.com/store/apps/details?id=app.batchmate.app"

function LoginPage() {
	return (
		<AuthLayout>
			<LoginForm
				logoSource="/rc_octopus_cyan.png"
				onSubmit={async () => {
					await signIn.social({ provider: "recurse", callbackURL: "/" })
				}}
			/>
			<div className="mt-8 flex flex-col items-center gap-3 px-6">
				<span className="font-mono text-[11px] tracking-widest text-text-muted">
					ALSO AVAILABLE ON
				</span>
				<div className="flex items-center gap-3">
					<a
						href={APP_STORE_URL}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Download on the App Store"
					>
						<img
							src="/app-store-badge.svg"
							alt="Download on the App Store"
							className="h-10 w-auto"
						/>
					</a>
					<a
						href={PLAY_STORE_URL}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Get it on Google Play"
					>
						<img
							src="/google-play-badge.png"
							alt="Get it on Google Play"
							className="h-[58px] w-auto"
						/>
					</a>
				</div>
			</div>
		</AuthLayout>
	)
}
