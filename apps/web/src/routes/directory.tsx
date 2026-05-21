import { ROLES, SCOPES } from "@batchmate/ui"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router"
import { Briefcase, Calendar, MapPin, Search, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { z } from "zod"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageLayout } from "@/components/page-layout"
import { PersonCard } from "@/components/person-card"
import { PersonGridCard } from "@/components/person-grid-card"
import { ScopeChip } from "@/components/scope-chip"
import { ViewToggle } from "@/components/view-toggle"
import { api } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth"
import { useStoredView } from "@/lib/use-stored-view"

const PAGE_SIZE = 50
const SEARCH_DEBOUNCE_MS = 300

const directorySearchSchema = z.object({
	query: z.string().optional().catch(undefined),
	batchId: z.coerce.number().optional().catch(undefined),
	batchName: z.string().optional().catch(undefined),
	locationId: z.coerce.number().optional().catch(undefined),
	locationName: z.string().optional().catch(undefined),
	role: z.enum(["recurser", "resident", "faculty"]).optional().catch(undefined),
	scope: z.enum(["current", "overlap", "ngw"]).optional().catch(undefined),
})

type DirectorySearch = z.infer<typeof directorySearchSchema>

export const Route = createFileRoute("/directory")({
	validateSearch: directorySearchSchema,
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession()
		if (!session) {
			throw redirect({ to: "/login" })
		}
	},
	component: DirectoryPage,
})

function DirectoryPage() {
	const { data: session } = useSession()
	const navigate = useNavigate({ from: "/directory" })
	const { query, batchId, batchName, locationId, locationName, role, scope } =
		Route.useSearch()

	const loadMoreRef = useRef<HTMLDivElement>(null)
	const [openDropdown, setOpenDropdown] = useState<
		"batch" | "role" | "location" | null
	>(null)
	const [searchInput, setSearchInput] = useState(query ?? "")
	const [view, setView] = useStoredView("directory")
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

	// Sync local input when URL query changes externally (e.g. back/forward)
	useEffect(() => {
		setSearchInput(query ?? "")
	}, [query])

	function updateSearch(updates: Partial<DirectorySearch>) {
		navigate({
			search: (prev) => {
				const next: Record<string, unknown> = { ...prev, ...updates }
				for (const [key, value] of Object.entries(next)) {
					if (value === undefined) delete next[key]
				}
				return next as DirectorySearch
			},
			replace: true,
		})
	}

	function handleSearchInput(value: string) {
		setSearchInput(value)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			updateSearch({ query: value || undefined })
		}, SEARCH_DEBOUNCE_MS)
	}

	function toggleDropdown(name: "batch" | "role" | "location") {
		setOpenDropdown((prev) => (prev === name ? null : name))
	}

	const {
		data: results,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: [
			"directorySearch",
			query || undefined,
			batchId,
			locationId,
			role,
			scope,
		],
		queryFn: async ({ pageParam = 0 }) =>
			api.directorySearch.call({
				query: query || undefined,
				batchId,
				locationId,
				role,
				scope,
				limit: PAGE_SIZE,
				offset: pageParam,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.people.length < PAGE_SIZE) return undefined
			return allPages.reduce((total, page) => total + page.people.length, 0)
		},
	})

	const { data: batches, isLoading: batchesLoading } = useQuery({
		...api.batches.queryOptions({}),
		enabled: openDropdown === "batch",
	})

	const { data: locations, isLoading: locationsLoading } = useQuery({
		...api.locations.queryOptions({ input: {} }),
		enabled: openDropdown === "location",
	})

	// Infinite scroll
	useEffect(() => {
		const el = loadMoreRef.current
		if (!el) return
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage()
				}
			},
			{ threshold: 0 },
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [hasNextPage, isFetchingNextPage, fetchNextPage])

	const people = results?.pages.flatMap((page) => page.people) ?? []
	const hasFilters = batchId != null || role != null || locationId != null

	return (
		<PageLayout
			className="gap-5"
			subtitle="Search the RC community"
			title="Directory"
			headerRight={
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
			}
		>
			{/* Search bar */}
			<div className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-3.5 py-2.5">
				<Search size={18} color="#64748B" />
				<input
					type="text"
					placeholder="Search by name, interests..."
					value={searchInput}
					onChange={(e) => handleSearchInput(e.target.value)}
					className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-text-tertiary"
				/>
			</div>

			{/* Filter chips */}
			<div className="flex flex-wrap items-center gap-2">
				<FilterDropdown
					icon={Calendar}
					label={batchName ?? "Batch"}
					active={batchId != null}
					items={batches ?? []}
					isLoading={batchesLoading}
					open={openDropdown === "batch"}
					onToggle={() => toggleDropdown("batch")}
					onSelect={(batch) => {
						updateSearch({ batchId: batch.id, batchName: batch.name })
						setOpenDropdown(null)
					}}
					onClear={() =>
						updateSearch({ batchId: undefined, batchName: undefined })
					}
				/>
				<FilterDropdown
					icon={Briefcase}
					label={
						role
							? (ROLES.find((r) => r.value === role)?.name ?? "Role")
							: "Role"
					}
					active={role != null}
					items={ROLES}
					isLoading={false}
					open={openDropdown === "role"}
					onToggle={() => toggleDropdown("role")}
					onSelect={(r) => {
						updateSearch({ role: r.value })
						setOpenDropdown(null)
					}}
					onClear={() => updateSearch({ role: undefined })}
				/>
				<FilterDropdown
					icon={MapPin}
					label={locationName ?? "Location"}
					active={locationId != null}
					items={locations ?? []}
					isLoading={locationsLoading}
					open={openDropdown === "location"}
					onToggle={() => toggleDropdown("location")}
					onSelect={(loc) => {
						updateSearch({ locationId: loc.id, locationName: loc.name })
						setOpenDropdown(null)
					}}
					onClear={() =>
						updateSearch({ locationId: undefined, locationName: undefined })
					}
				/>
				{hasFilters && (
					<button
						type="button"
						onClick={() =>
							updateSearch({
								batchId: undefined,
								batchName: undefined,
								locationId: undefined,
								locationName: undefined,
								role: undefined,
							})
						}
						className="cursor-pointer text-xs text-text-tertiary hover:text-foreground"
					>
						Clear filters
					</button>
				)}
			</div>

			{/* Scope chips + view toggle */}
			<div className="flex items-center gap-2">
				{SCOPES.map((s) => (
					<ScopeChip
						key={s.value}
						label={s.label}
						active={scope === s.value}
						onClick={() =>
							updateSearch({
								scope: scope === s.value ? undefined : s.value,
							})
						}
					/>
				))}
				<ViewToggle view={view} onSetView={setView} />
			</div>

			{/* People list */}
			{isLoading && (
				<div className="flex flex-1 items-center justify-center">
					<span className="text-sm text-text-tertiary">Searching...</span>
				</div>
			)}

			{!isLoading && people.length === 0 && (
				<div className="flex flex-1 flex-col items-center justify-center gap-3">
					<Search size={48} color="#475569" />
					<span className="text-sm text-text-tertiary">No results found</span>
				</div>
			)}

			{people.length > 0 &&
				(view === "grid" ? (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{people.map((person) => (
							<PersonGridCard
								key={person.id}
								personId={person.id}
								name={person.name}
								imageUrl={person.imageUrl}
								batch={person.batch}
								stintType={person.stintType}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3">
						{people.map((person) => (
							<PersonCard
								key={person.id}
								personId={person.id}
								name={person.name}
								imageUrl={person.imageUrl}
								batch={person.batch}
								stintType={person.stintType}
							/>
						))}
					</div>
				))}
			{isFetchingNextPage && (
				<div className="flex items-center justify-center py-4">
					<span className="text-sm text-text-tertiary">Loading...</span>
				</div>
			)}
			<div ref={loadMoreRef} className="h-1" />
		</PageLayout>
	)
}
