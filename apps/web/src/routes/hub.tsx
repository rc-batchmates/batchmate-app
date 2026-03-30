import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { CheckCircle, ChevronRight, MapPin, User, Users } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
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
	const queryClient = useQueryClient()
	const {
		data: hub,
		isLoading,
		error,
	} = useQuery(api.hubVisits.queryOptions({}))

	const checkin = useMutation({
		...api.hubCheckin.mutationOptions({}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: api.hubVisits.queryOptions({}).queryKey,
			})
		},
	})

	const visitors = hub?.visitors
	const isCheckedIn = hub?.isCheckedIn ?? false

	return (
		<PageLayout
			className="gap-6"
			subtitle="Currently at RC"
			title="In the Hub"
			headerRight={
				<div className="flex items-center gap-4">
					{visitors && (
						<div className="flex items-center gap-1.5 rounded-full bg-cyan/10 px-3.5 py-1.5">
							<div className="h-2 w-2 rounded-full bg-cyan" />
							<span className="text-[13px] font-medium text-cyan">
								{visitors.length} {visitors.length === 1 ? "person" : "people"}
							</span>
						</div>
					)}
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
			}
		>
			{/* Check in */}
			{hub && !isCheckedIn && (
				<button
					type="button"
					onClick={() => checkin.mutate({})}
					disabled={checkin.isPending}
					className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan text-background disabled:opacity-50"
				>
					<MapPin size={18} />
					<span className="text-[15px] font-semibold">
						{checkin.isPending ? "Checking in..." : "Check in to the Hub"}
					</span>
				</button>
			)}

			{hub && isCheckedIn && (
				<div className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-cyan/20 bg-cyan/10">
					<CheckCircle size={18} color="#22D3EE" />
					<span className="text-sm font-medium text-cyan">
						You're checked in
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

			{visitors && visitors.length === 0 && (
				<div className="flex flex-1 flex-col items-center justify-center gap-3">
					<Users size={48} color="#475569" />
					<span className="text-sm text-text-tertiary">
						Nobody is in the hub right now
					</span>
				</div>
			)}

			{visitors && visitors.length > 0 && (
				<div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3">
					{visitors.map((visit) => (
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
		</PageLayout>
	)
}
