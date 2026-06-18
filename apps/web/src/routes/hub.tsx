import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import {
	ArrowUpDown,
	CheckCircle,
	MapPin,
	Moon,
	User,
	Users,
} from "lucide-react"
import { useMemo, useState } from "react"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageLayout } from "@/components/page-layout"
import { PersonCard } from "@/components/person-card"
import { PersonGridCard } from "@/components/person-grid-card"
import { ScopeChip } from "@/components/scope-chip"
import { ViewToggle } from "@/components/view-toggle"
import { api } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth"
import { useStoredView } from "@/lib/use-stored-view"

type SortKey = "firstName" | "lastName" | "checkInTime"

const SORT_OPTIONS: { id: number; name: string; key: SortKey }[] = [
	{ id: 1, name: "First name", key: "firstName" },
	{ id: 2, name: "Last name", key: "lastName" },
	{ id: 3, name: "Check-in time", key: "checkInTime" },
]

function hourInNYT(iso: string): number | null {
	if (!iso) return null
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return null
	return Number(
		new Intl.DateTimeFormat("en-US", {
			timeZone: "America/New_York",
			hour: "numeric",
			hour12: false,
		}).format(d),
	)
}

function firstName(name: string) {
	return name.split(" ")[0] ?? ""
}

function lastName(name: string) {
	const parts = name.split(" ")
	return parts[parts.length - 1] ?? ""
}

function OvernightBadge() {
	return (
		<span className="group/badge relative flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
			<Moon size={11} />
			Overnight
			<span
				role="tooltip"
				className="pointer-events-none absolute top-full right-0 z-50 mt-1 hidden w-56 rounded-md border border-border bg-background px-2.5 py-2 text-[11px] font-normal text-text-secondary shadow-lg group-hover/badge:block"
			>
				Some folks auto check in at midnight, so they may not actually be in the
				hub yet.
			</span>
		</span>
	)
}

export const Route = createFileRoute("/hub")({
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession()
		if (!session) {
			throw redirect({ to: "/login" })
		}
	},
	component: HubPage,
})

function HubPage() {
	const { data: session } = useSession()
	const queryClient = useQueryClient()

	// Check-in status has its own lightweight endpoint so the check-in section at
	// the top can render before the slower visitor profiles below. This endpoint
	// is the source of truth for the current user's status.
	const { data: checkInStatus } = useQuery(api.isCheckedIn.queryOptions({}))

	// Visitor profiles (the list below) — slower to load; fetched separately.
	const {
		data: hub,
		isLoading,
		error,
	} = useQuery(api.hubVisits.queryOptions({}))

	const isCheckedInQueryKey = api.isCheckedIn.queryOptions({}).queryKey
	const hubQueryKey = api.hubVisits.queryOptions({}).queryKey
	const checkin = useMutation({
		...api.hubCheckin.mutationOptions({}),
		onSuccess: () => {
			// Optimistically flip the source-of-truth status, then invalidate it and
			// the visitor list so the freshly checked-in user shows up below.
			queryClient.setQueryData(
				isCheckedInQueryKey,
				(old: typeof checkInStatus | undefined) =>
					old ? { ...old, isCheckedIn: true } : old,
			)
			queryClient.invalidateQueries({ queryKey: isCheckedInQueryKey })
			queryClient.invalidateQueries({ queryKey: hubQueryKey })
		},
	})

	const visitors = hub?.visitors
	const isCheckedIn = checkInStatus?.isCheckedIn ?? false

	const [sortKey, setSortKey] = useState<SortKey>("firstName")
	const [showOvernight, setShowOvernight] = useState(false)
	const [sortOpen, setSortOpen] = useState(false)
	const [view, setView] = useStoredView("hub")

	const { mainList, overnightCount, overnightIds } = useMemo(() => {
		if (!visitors) {
			return {
				mainList: [],
				overnightCount: 0,
				overnightIds: new Set<number>(),
			}
		}
		const overnightSet = new Set<number>()
		const overnight: typeof visitors = []
		const rest: typeof visitors = []
		for (const v of visitors) {
			const h = hourInNYT(v.checkedInAt)
			if (h !== null && h < 5) {
				overnight.push(v)
				overnightSet.add(v.personId)
			} else {
				rest.push(v)
			}
		}
		const pool = showOvernight ? [...rest, ...overnight] : rest
		const sorted = [...pool].sort((a, b) => {
			if (sortKey === "checkInTime") {
				return (b.checkedInAt ?? "").localeCompare(a.checkedInAt ?? "")
			}
			const fn = sortKey === "lastName" ? lastName : firstName
			return fn(a.name).localeCompare(fn(b.name), undefined, {
				sensitivity: "base",
			})
		})
		return {
			mainList: sorted,
			overnightCount: overnight.length,
			overnightIds: overnightSet,
		}
	}, [visitors, sortKey, showOvernight])

	const currentSortLabel =
		SORT_OPTIONS.find((s) => s.key === sortKey)?.name ?? "Sort"

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
								{mainList.length} {mainList.length === 1 ? "person" : "people"}
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
			{checkInStatus && !isCheckedIn && (
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

			{checkInStatus && isCheckedIn && (
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
				<>
					<div className="flex flex-wrap items-center gap-2">
						<FilterDropdown
							icon={ArrowUpDown}
							label={currentSortLabel}
							active={false}
							items={SORT_OPTIONS}
							isLoading={false}
							open={sortOpen}
							onToggle={() => setSortOpen((o) => !o)}
							onSelect={(opt) => {
								setSortKey(opt.key)
								setSortOpen(false)
							}}
							clearable={false}
						/>
						{overnightCount > 0 && (
							<ScopeChip
								label={
									showOvernight
										? `Hide ${overnightCount} overnight`
										: `Show ${overnightCount} overnight`
								}
								active={showOvernight}
								onClick={() => setShowOvernight((s) => !s)}
							/>
						)}
						<ViewToggle view={view} onSetView={setView} />
					</div>
					{mainList.length === 0 ? (
						<div className="flex flex-1 flex-col items-center justify-center gap-3">
							<Moon size={48} color="#475569" />
							<span className="text-sm text-text-tertiary">
								Only overnight check-ins so far
							</span>
						</div>
					) : view === "grid" ? (
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
							{mainList.map((visit) => (
								<PersonGridCard
									key={visit.personId}
									personId={visit.personId}
									name={visit.name}
									imageUrl={visit.imageUrl}
									batch={visit.batch}
									stintType={visit.stintType}
									badge={
										overnightIds.has(visit.personId) ? <OvernightBadge /> : null
									}
								/>
							))}
						</div>
					) : (
						<div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3">
							{mainList.map((visit) => (
								<PersonCard
									key={visit.personId}
									personId={visit.personId}
									name={visit.name}
									imageUrl={visit.imageUrl}
									batch={visit.batch}
									stintType={visit.stintType}
									badge={
										overnightIds.has(visit.personId) ? <OvernightBadge /> : null
									}
								/>
							))}
						</div>
					)}
				</>
			)}
		</PageLayout>
	)
}
