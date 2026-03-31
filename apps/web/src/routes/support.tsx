import { createFileRoute, Link } from "@tanstack/react-router"
import { PageLayout } from "@/components/page-layout"
import { Mail } from "lucide-react"

export const Route = createFileRoute("/support")({
	component: SupportPage,
})

function SupportPage() {
	return (
		<PageLayout title="Support" subtitle="We're here to help">
			<div className="flex flex-col gap-6">
				<div className="rounded-xl bg-card p-5">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-inset">
							<Mail size={18} color="#22D3EE" />
						</div>
						<div>
							<p className="text-sm font-semibold text-foreground">Email</p>
							<a
								href="mailto:support@leftshift.com"
								className="text-sm text-cyan hover:underline"
							>
								support@leftshift.com
							</a>
						</div>
					</div>
					<p className="mt-3 text-sm leading-relaxed text-text-secondary">
						For general inquiries, bug reports, feature requests, or account
						issues. We aim to respond within 2 business days.
					</p>
				</div>

				<div className="rounded-xl bg-card p-5">
					<p className="text-sm font-semibold text-foreground">
						Privacy &amp; Data Requests
					</p>
					<p className="mt-2 text-sm leading-relaxed text-text-secondary">
						To exercise Your data rights (access, deletion, correction, etc.),
						email us at{" "}
						<a
							href="mailto:support@leftshift.com"
							className="text-cyan hover:underline"
						>
							support@leftshift.com
						</a>
						. For details on Your rights, see Our{" "}
						<Link to="/privacy" className="text-cyan hover:underline">
							Privacy Policy
						</Link>{" "}
						and{" "}
						<Link to="/gdpr" className="text-cyan hover:underline">
							GDPR
						</Link>{" "}
						pages.
					</p>
				</div>

				<div className="rounded-xl bg-card p-5">
					<p className="text-sm font-semibold text-foreground">
						Left Shift Logical, LLC
					</p>
					<p className="mt-2 text-sm leading-relaxed text-text-secondary">
						418 Broadway STE N
						<br />
						Albany, NY 12207
						<br />
						United States
					</p>
				</div>
			</div>
		</PageLayout>
	)
}
