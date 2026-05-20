import { ROLES, SCOPES, Text } from "@batchmate/ui"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import { Briefcase, Calendar, MapPin, Search } from "lucide-react-native"
import { useRef, useState } from "react"
import { FlatList, TextInput, View } from "react-native"
import { DropdownList } from "../../../src/components/dropdown-list"
import { FilterChip } from "../../../src/components/filter-chip"
import { PersonCard } from "../../../src/components/person-card"
import { ScopeChip } from "../../../src/components/scope-chip"
import { api } from "../../../src/lib/api"

const PAGE_SIZE = 50
const SEARCH_DEBOUNCE_MS = 300

type Scope = "current" | "overlap" | "ngw"
type Role = "recurser" | "resident" | "faculty"

function DirectoryHeader({
	query,
	onSearchChange,
	batchId,
	batchName,
	role,
	locationId,
	locationName,
	scope,
	openDropdown,
	onToggleDropdown,
	onClearBatch,
	onClearRole,
	onClearLocation,
	onSelectBatch,
	onSelectRole,
	onSelectLocation,
	onSetScope,
	batches,
	batchesLoading,
	locations,
	locationsLoading,
}: {
	query: string
	onSearchChange: (value: string) => void
	batchId: number | undefined
	batchName: string | undefined
	role: Role | undefined
	locationId: number | undefined
	locationName: string | undefined
	scope: Scope | undefined
	openDropdown: "batch" | "role" | "location" | null
	onToggleDropdown: (name: "batch" | "role" | "location") => void
	onClearBatch: () => void
	onClearRole: () => void
	onClearLocation: () => void
	onSelectBatch: (batch: { id: number; name: string }) => void
	onSelectRole: (role: Role) => void
	onSelectLocation: (loc: { id: number; name: string }) => void
	onSetScope: (scope: Scope | undefined) => void
	batches: { id: number; name: string }[]
	batchesLoading: boolean
	locations: { id: number; name: string }[]
	locationsLoading: boolean
}) {
	return (
		<View className="gap-5 pb-2">
			<View className="gap-1">
				<Text className="text-sm text-text-tertiary">
					Search the RC community
				</Text>
				<Text className="text-2xl font-semibold">Directory</Text>
			</View>

			<View className="flex-row items-center gap-2 rounded-[10px] border border-border bg-card px-3.5 py-2.5">
				<Search size={18} color="#64748B" />
				<TextInput
					placeholder="Search by name, interests..."
					placeholderTextColor="#64748B"
					value={query}
					onChangeText={onSearchChange}
					className="flex-1 text-sm text-foreground"
					returnKeyType="search"
				/>
			</View>

			<View className="flex-row flex-wrap gap-2">
				<FilterChip
					icon={Calendar}
					label={batchName ?? "Batch"}
					active={batchId != null}
					onPress={
						batchId != null ? onClearBatch : () => onToggleDropdown("batch")
					}
				/>
				<FilterChip
					icon={Briefcase}
					label={
						role
							? (ROLES.find((r) => r.value === role)?.name ?? "Role")
							: "Role"
					}
					active={role != null}
					onPress={role != null ? onClearRole : () => onToggleDropdown("role")}
				/>
				<FilterChip
					icon={MapPin}
					label={locationName ?? "Location"}
					active={locationId != null}
					onPress={
						locationId != null
							? onClearLocation
							: () => onToggleDropdown("location")
					}
				/>
			</View>

			{openDropdown === "batch" && (
				<DropdownList
					items={batches}
					isLoading={batchesLoading}
					onSelect={onSelectBatch}
					activeValue={batchName}
				/>
			)}
			{openDropdown === "role" && (
				<DropdownList
					items={ROLES}
					isLoading={false}
					onSelect={(r) => onSelectRole(r.value as Role)}
					activeValue={
						role ? ROLES.find((r) => r.value === role)?.name : undefined
					}
				/>
			)}
			{openDropdown === "location" && (
				<DropdownList
					items={locations}
					isLoading={locationsLoading}
					onSelect={onSelectLocation}
					activeValue={locationName}
				/>
			)}

			<View className="flex-row gap-2">
				{SCOPES.map((s) => (
					<ScopeChip
						key={s.value}
						label={s.label}
						active={scope === s.value}
						onPress={() => onSetScope(scope === s.value ? undefined : s.value)}
					/>
				))}
			</View>
		</View>
	)
}

// --- Screen ---

export default function DirectoryScreen() {
	const router = useRouter()
	const [query, setQuery] = useState("")
	const [debouncedQuery, setDebouncedQuery] = useState("")
	const [batchId, setBatchId] = useState<number | undefined>()
	const [batchName, setBatchName] = useState<string | undefined>()
	const [locationId, setLocationId] = useState<number | undefined>()
	const [locationName, setLocationName] = useState<string | undefined>()
	const [role, setRole] = useState<Role | undefined>()
	const [scope, setScope] = useState<Scope | undefined>()
	const [openDropdown, setOpenDropdown] = useState<
		"batch" | "role" | "location" | null
	>(null)
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

	function handleSearchInput(value: string) {
		setQuery(value)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			setDebouncedQuery(value)
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
			debouncedQuery || undefined,
			batchId,
			locationId,
			role,
			scope,
		],
		queryFn: async ({ pageParam = 0 }) =>
			api.directorySearch.call({
				query: debouncedQuery || undefined,
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

	const people = results?.pages.flatMap((page) => page.people) ?? []

	return (
		<FlatList
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4"
			data={people}
			keyExtractor={(item) => String(item.id)}
			keyboardShouldPersistTaps="handled"
			ListHeaderComponent={
				<DirectoryHeader
					query={query}
					onSearchChange={handleSearchInput}
					batchId={batchId}
					batchName={batchName}
					role={role}
					locationId={locationId}
					locationName={locationName}
					scope={scope}
					openDropdown={openDropdown}
					onToggleDropdown={toggleDropdown}
					onClearBatch={() => {
						setBatchId(undefined)
						setBatchName(undefined)
					}}
					onClearRole={() => setRole(undefined)}
					onClearLocation={() => {
						setLocationId(undefined)
						setLocationName(undefined)
					}}
					onSelectBatch={(batch) => {
						setBatchId(batch.id)
						setBatchName(batch.name)
						setOpenDropdown(null)
					}}
					onSelectRole={(r) => {
						setRole(r)
						setOpenDropdown(null)
					}}
					onSelectLocation={(loc) => {
						setLocationId(loc.id)
						setLocationName(loc.name)
						setOpenDropdown(null)
					}}
					onSetScope={setScope}
					batches={batches ?? []}
					batchesLoading={batchesLoading}
					locations={locations ?? []}
					locationsLoading={locationsLoading}
				/>
			}
			renderItem={({ item }) => (
				<View className="pb-2.5">
					<PersonCard
						name={item.name}
						imageUrl={item.imageUrl}
						batch={item.batch}
						stintType={item.stintType}
						onPress={() => router.push(`/(app)/member/${item.id}`)}
					/>
				</View>
			)}
			ListEmptyComponent={
				isLoading ? (
					<View className="items-center py-20">
						<Text className="text-sm text-text-tertiary">Searching...</Text>
					</View>
				) : (
					<View className="items-center gap-3 py-20">
						<Search size={48} color="#475569" />
						<Text className="text-sm text-text-tertiary">No results found</Text>
					</View>
				)
			}
			onEndReached={() => {
				if (hasNextPage && !isFetchingNextPage) fetchNextPage()
			}}
			onEndReachedThreshold={0.5}
			ListFooterComponent={
				isFetchingNextPage ? (
					<View className="items-center py-4">
						<Text className="text-sm text-text-tertiary">Loading...</Text>
					</View>
				) : null
			}
		/>
	)
}
