import { getInitials, getSubtitle, ROLES, SCOPES } from "@batchmate/ui"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router"
import {
	Briefcase,
	Calendar,
	ChevronDown,
	ChevronRight,
	MapPin,
	Search,
	User,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { z } from "zod"
import { api } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth"

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

// --- Components ---

function PersonCard({
	personId,
	name,
	imageUrl,
	batch,
	stintType,
}: {
	personId: number
	name: string
	imageUrl: string | null
	batch: string | null
	stintType: string | null
}) {
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
					<span className="text-sm font-semibold text-cyan">
						{getInitials(name)}
					</span>
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="text-[15px] font-medium text-foreground">{name}</span>
				<span className="text-xs text-text-tertiary">
					{getSubtitle(batch, stintType)}
				</span>
			</div>
			<ChevronRight size={20} color="#475569" />
		</Link>
	)
}

function ScopeChip({
	label,
	active,
	onClick,
}: {
	label: string
	active: boolean
	onClick: () => void
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
				active
					? "border-cyan/30 bg-cyan/10 text-cyan"
					: "border-border bg-card text-text-secondary hover:bg-card/80"
			}`}
		>
			{active && <div className="h-1.5 w-1.5 rounded-full bg-cyan" />}
			<span>{label}</span>
		</button>
	)
}

function FilterDropdown<T extends { id: number; name: string }>({
	icon: Icon,
	label,
	active,
	items,
	isLoading,
	open,
	onToggle,
	onSelect,
	onClear,
}: {
	icon: React.ComponentType<{ size: number; color: string }>
	label: string
	active: boolean
	items: T[]
	isLoading: boolean
	open: boolean
	onToggle: () => void
	onSelect: (item: T) => void
	onClear: () => void
}) {
	const ref = useRef<HTMLDivElement>(null)
	const onToggleRef = useRef(onToggle)
	onToggleRef.current = onToggle
	const [search, setSearch] = useState("")

	useEffect(() => {
		if (!open) return
		setSearch("")
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onToggleRef.current()
			}
		}
		document.addEventListener("mousedown", handleClick)
		return () => document.removeEventListener("mousedown", handleClick)
	}, [open])

	const filtered = items.filter((item) =>
		item.name.toLowerCase().includes(search.toLowerCase()),
	)

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={active ? onClear : onToggle}
				className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
					active
						? "border-cyan/30 bg-cyan/10 text-cyan"
						: "border-border bg-card text-text-secondary hover:bg-card/80"
				}`}
			>
				<Icon size={14} color={active ? "#22D3EE" : "#94A3B8"} />
				<span>{label}</span>
				<ChevronDown size={14} color={active ? "#22D3EE" : "#64748B"} />
			</button>
			{open && (
				<div className="absolute top-full left-0 z-50 mt-1 max-h-64 w-64 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
					<div className="border-b border-border p-2">
						<input
							type="text"
							placeholder="Search..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full rounded-md bg-card px-3 py-1.5 text-sm text-foreground outline-none placeholder:text-text-tertiary"
							// biome-ignore lint/a11y/noAutofocus: dropdown search should focus on open
							autoFocus
						/>
					</div>
					<div className="max-h-48 overflow-y-auto p-1">
						{isLoading && (
							<div className="px-3 py-2 text-sm text-text-tertiary">
								Loading...
							</div>
						)}
						{!isLoading && filtered.length === 0 && (
							<div className="px-3 py-2 text-sm text-text-tertiary">
								No results
							</div>
						)}
						{filtered.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => onSelect(item)}
								className="w-full cursor-pointer rounded-md px-3 py-1.5 text-left text-sm text-foreground hover:bg-card"
							>
								{item.name}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

// --- Page ---

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
		<div className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-6 py-8 md:max-w-4xl md:py-12">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-1">
					<span className="text-sm text-text-tertiary">
						Search the RC community
					</span>
					<span className="text-2xl font-semibold text-foreground md:text-3xl">
						Directory
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
							className="text-sm font-medium text-text-tertiary no-underline hover:text-foreground"
						>
							Hub
						</Link>
						<span className="text-sm font-semibold text-cyan">Directory</span>
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

			{/* Scope chips */}
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

			{people.length > 0 && (
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
			)}
			{isFetchingNextPage && (
				<div className="flex items-center justify-center py-4">
					<span className="text-sm text-text-tertiary">Loading...</span>
				</div>
			)}
			<div ref={loadMoreRef} className="h-1" />
		</div>
	)
}
