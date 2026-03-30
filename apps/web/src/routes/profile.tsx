import {
	createFileRoute,
	redirect,
	useNavigate,
} from "@tanstack/react-router"
import {
	ExternalLink,
	Github,
	Globe,
	Hash,
	Linkedin,
	LogOut,
	Mail,
	Twitter,
	User,
} from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { authClient, signOut, useSession } from "@/lib/auth"

export const Route = createFileRoute("/profile")({
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession()
		if (!session) {
			throw redirect({ to: "/login" })
		}
	},
	component: ProfilePage,
})

function InfoRow({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Mail
	label: string
	value?: string | null
}) {
	return (
		<div className="flex items-center gap-3 px-4 py-3.5">
			<Icon size={18} color="#64748B" />
			<div className="flex flex-1 flex-col gap-0.5">
				<span className="text-xs text-text-tertiary">{label}</span>
				<span className="font-mono text-sm font-medium text-foreground">
					{value || "—"}
				</span>
			</div>
		</div>
	)
}

function SocialRow({
	icon: Icon,
	label,
	value,
	href,
}: {
	icon: typeof Github
	label: string
	value?: string | null
	href?: string
}) {
	const content = (
		<div className="flex items-center gap-3 px-4 py-3.5">
			<Icon size={18} color="#64748B" />
			<div className="flex flex-1 flex-col gap-0.5">
				<span className="text-xs text-text-tertiary">{label}</span>
				<span className="break-all font-mono text-sm font-medium text-cyan">
					{value || "—"}
				</span>
			</div>
			{value && <ExternalLink size={16} color="#475569" />}
		</div>
	)

	if (href && value) {
		return (
			<a href={href} target="_blank" rel="noopener noreferrer">
				{content}
			</a>
		)
	}
	return content
}

function ProfilePage() {
	const navigate = useNavigate()
	const { data: session } = useSession()
	const user = session?.user as
		| (Record<string, string | null | undefined> & {
				name?: string
				email?: string
				rcId?: string
				github?: string
				twitter?: string
				linkedin?: string
				personalSiteUrl?: string
		  })
		| undefined

	async function handleSignOut() {
		await signOut()
		navigate({ to: "/login" })
	}

	return (
		<PageLayout
			subtitle="Your account"
			title="Profile"
			headerRight={
				<a
					href="https://www.recurse.com/settings/general"
					target="_blank"
					rel="noopener noreferrer"
					className="text-sm font-medium text-cyan no-underline"
				>
					Edit
				</a>
			}
		>
			{/* Avatar */}
			<div className="flex flex-col items-center gap-3">
				<div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-card">
					{user?.image ? (
						<img
							src={user.image}
							alt=""
							className="h-full w-full object-cover"
						/>
					) : (
						<User size={44} color="#22D3EE" />
					)}
				</div>
				<span className="text-[22px] font-semibold text-foreground">
					{user?.name}
				</span>
				<div className="flex items-center gap-1.5">
					<div className="h-2 w-2 rounded-full bg-cyan" />
					<span className="font-mono text-[13px] font-medium text-cyan">
						{user?.batch ?? "Recurser"}
					</span>
				</div>
			</div>

			{/* Contact & Social */}
			<div className="flex flex-col gap-7 md:flex-row md:gap-5">
				<div className="flex flex-1 flex-col gap-3">
					<span className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
						CONTACT
					</span>
					<div className="overflow-hidden rounded-xl bg-card">
						<InfoRow icon={Mail} label="Email" value={user?.email} />
						<div className="h-px bg-surface-inset" />
						<InfoRow icon={Hash} label="Recurse ID" value={user?.rcId} />
					</div>
				</div>

				<div className="flex flex-1 flex-col gap-3">
					<span className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
						SOCIAL
					</span>
					<div className="overflow-hidden rounded-xl bg-card">
						<SocialRow
							icon={Github}
							label="GitHub"
							value={user?.github}
							href={
								user?.github ? `https://github.com/${user.github}` : undefined
							}
						/>
						<div className="h-px bg-surface-inset" />
						<SocialRow
							icon={Linkedin}
							label="LinkedIn"
							value={user?.linkedin}
							href={
								user?.linkedin
									? `https://linkedin.com/in/${user.linkedin}`
									: undefined
							}
						/>
						<div className="h-px bg-surface-inset" />
						<SocialRow
							icon={Twitter}
							label="Twitter"
							value={user?.twitter}
							href={
								user?.twitter
									? `https://twitter.com/${user.twitter}`
									: undefined
							}
						/>
						<div className="h-px bg-surface-inset" />
						<SocialRow
							icon={Globe}
							label="Website"
							value={user?.personalSiteUrl}
							href={user?.personalSiteUrl ?? undefined}
						/>
					</div>
				</div>
			</div>

			{/* Sign Out */}
			<button
				type="button"
				onClick={handleSignOut}
				className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan/20 bg-card px-4 py-3 cursor-pointer md:w-48"
			>
				<LogOut size={18} color="#94A3B8" />
				<span className="text-sm font-medium text-text-secondary">
					Sign Out
				</span>
			</button>

		</PageLayout>
	)
}
