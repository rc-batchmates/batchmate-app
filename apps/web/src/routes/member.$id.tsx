import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import {
	ChevronLeft,
	ExternalLink,
	Github,
	Globe,
	Hash,
	Linkedin,
	Mail,
	Twitter,
	User,
} from "lucide-react"
import { api } from "@/lib/api"
import { authClient } from "@/lib/auth"

export const Route = createFileRoute("/member/$id")({
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession()
		if (!session) {
			throw redirect({ to: "/login" })
		}
	},
	component: MemberProfilePage,
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
				<span className="font-mono text-sm font-medium text-cyan">
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

function MemberProfilePage() {
	const { id } = Route.useParams()
	const {
		data: member,
		isLoading,
		error,
	} = useQuery(api.memberProfile.queryOptions({ input: { id: Number(id) } }))

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<span className="text-sm text-text-tertiary">Loading...</span>
			</div>
		)
	}

	if (error || !member) {
		return (
			<div className="flex h-full items-center justify-center">
				<span className="text-sm text-destructive">Member not found</span>
			</div>
		)
	}

	return (
		<div className="mx-auto flex h-full max-w-md flex-col gap-7 px-6 py-8 md:max-w-4xl md:py-12">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-1">
					<Link
						to="/hub"
						className="flex items-center gap-1 text-sm text-text-tertiary no-underline hover:text-foreground"
					>
						<ChevronLeft size={14} color="#64748B" />
						Back to Hub
					</Link>
					<span className="text-2xl font-semibold text-foreground md:text-3xl">
						{member.name}
					</span>
					<nav className="mt-1 hidden items-center gap-5 md:flex">
						<Link
							to="/"
							className="text-sm font-medium text-text-tertiary no-underline hover:text-foreground"
						>
							Home
						</Link>
						<Link
							to="/hub"
							className="text-sm font-semibold text-cyan no-underline"
						>
							Hub
						</Link>
						<Link
							to="/profile"
							className="text-sm font-medium text-text-tertiary no-underline hover:text-foreground"
						>
							Profile
						</Link>
					</nav>
				</div>
			</div>

			{/* Avatar */}
			<div className="flex flex-col items-center gap-3">
				<div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-card">
					{member.imageUrl ? (
						<img
							src={member.imageUrl}
							alt=""
							className="h-full w-full object-cover"
						/>
					) : (
						<User size={44} color="#22D3EE" />
					)}
				</div>
				<span className="text-[22px] font-semibold text-foreground">
					{member.name}
				</span>
				{member.pronouns && (
					<span className="text-sm text-text-tertiary">{member.pronouns}</span>
				)}
				<div className="flex items-center gap-1.5">
					<div className="h-2 w-2 rounded-full bg-cyan" />
					<span className="font-mono text-[13px] font-medium text-cyan">
						{member.batch ?? "Recurser"}
					</span>
				</div>
			</div>

			{/* Bio */}
			{(member.bio || member.duringRc) && (
				<div className="flex flex-col gap-3">
					<span className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
						ABOUT
					</span>
					<div className="overflow-hidden rounded-xl bg-card px-4 py-3.5">
						<p className="text-sm leading-relaxed text-text-secondary">
							{member.duringRc || member.bio}
						</p>
					</div>
				</div>
			)}

			{/* Contact & Social */}
			<div className="flex flex-col gap-7 md:flex-row md:gap-5">
				<div className="flex flex-1 flex-col gap-3">
					<span className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
						CONTACT
					</span>
					<div className="overflow-hidden rounded-xl bg-card">
						<InfoRow icon={Mail} label="Email" value={member.email} />
						<div className="h-px bg-surface-inset" />
						<InfoRow icon={Hash} label="Recurse ID" value={String(member.id)} />
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
							value={member.github}
							href={
								member.github
									? `https://github.com/${member.github}`
									: undefined
							}
						/>
						<div className="h-px bg-surface-inset" />
						<SocialRow
							icon={Linkedin}
							label="LinkedIn"
							value={member.linkedin}
							href={
								member.linkedin
									? `https://linkedin.com/in/${member.linkedin}`
									: undefined
							}
						/>
						<div className="h-px bg-surface-inset" />
						<SocialRow
							icon={Twitter}
							label="Twitter"
							value={member.twitter}
							href={
								member.twitter
									? `https://twitter.com/${member.twitter}`
									: undefined
							}
						/>
						<div className="h-px bg-surface-inset" />
						<SocialRow
							icon={Globe}
							label="Website"
							value={member.personalSiteUrl}
							href={member.personalSiteUrl ?? undefined}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
