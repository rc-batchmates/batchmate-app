import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { ChevronRight, User, Users } from "lucide-react"
import { api } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth"

export const Route = createFileRoute("/hub")({
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession()
		if (!session) {
			throw redirect({ to: "/login" })
		}
	},
	component: HubPage,
})

function PersonCard({
	personId,
	name,
	imageUrl,
	batch,
}: {
	personId: number
	name: string
	imageUrl: string | null
	batch: string | null
}) {
	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase()

	return (
		<Link
			to="/member/$id"
			params={{ id: String(personId) }}
			className="flex items-center gap-3.5 rounded-xl bg-card px-4 py-3.5 no-underline transition-colors hover:bg-card/80"
		>
			<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-inset">
				{imageUrl ? (
					<img src={imageUrl} alt="" className="h-full w-full object-cover" />
				) : (
					<span className="text-sm font-semibold text-cyan">{initials}</span>
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="text-[15px] font-medium text-foreground">{name}</span>
				<span className="text-xs text-text-tertiary">
					{batch ?? "Recurser"}
				</span>
			</div>
			<ChevronRight size={20} color="#475569" />
		</Link>
	)
}

function HubPage() {
	const { data: session } = useSession()
	const {
		data: visits,
		isLoading,
		error,
	} = useQuery(api.hubVisits.queryOptions({}))

	return (
		<div className="mx-auto flex h-full max-w-md flex-col gap-6 px-6 py-8 md:max-w-4xl md:py-12">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-1">
					<span className="text-sm text-text-tertiary">Currently at RC</span>
					<span className="text-2xl font-semibold text-foreground md:text-3xl">
						In the Hub
					</span>
					<nav className="mt-1 hidden items-center gap-5 md:flex">
						<Link
							to="/"
							className="text-sm font-medium text-text-tertiary no-underline hover:text-foreground"
						>
							Home
						</Link>
						<span className="text-sm font-semibold text-cyan">Hub</span>
						<Link
							to="/profile"
							className="text-sm font-medium text-text-tertiary no-underline hover:text-foreground"
						>
							Profile
						</Link>
					</nav>
				</div>
				<Link
					to="/profile"
					className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-card"
				>
					{session?.user?.image ? (
						<img
							src={session.user.image}
							alt=""
							className="h-full w-full object-cover"
						/>
					) : (
						<User size={22} color="#22D3EE" />
					)}
				</Link>
			</div>

			{/* Count badge */}
			{visits && (
				<div className="flex items-center gap-1.5 self-start rounded-full bg-cyan/10 px-3.5 py-1.5">
					<div className="h-2 w-2 rounded-full bg-cyan" />
					<span className="text-[13px] font-medium text-cyan">
						{visits.length} {visits.length === 1 ? "person" : "people"}
					</span>
				</div>
			)}

			{/* People list */}
			{isLoading && (
				<div className="flex flex-1 items-center justify-center">
					<span className="text-sm text-text-tertiary">Loading...</span>
				</div>
			)}

			{error && (
				<div className="flex flex-1 flex-col items-center justify-center gap-2">
					<span className="text-sm text-destructive">
						Failed to load hub visits
					</span>
				</div>
			)}

			{visits && visits.length === 0 && (
				<div className="flex flex-1 flex-col items-center justify-center gap-3">
					<Users size={48} color="#475569" />
					<span className="text-sm text-text-tertiary">
						Nobody is in the hub right now
					</span>
				</div>
			)}

			{visits && visits.length > 0 && (
				<div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3">
					{visits.map((visit) => (
						<PersonCard
							key={visit.personId}
							personId={visit.personId}
							name={visit.name}
							imageUrl={visit.imageUrl}
							batch={visit.batch}
						/>
					))}
				</div>
			)}
		</div>
	)
}
