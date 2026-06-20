import { Text } from "@batchmate/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import {
	ArrowUpDown,
	CheckCircle,
	MapPin,
	Moon,
	Users,
} from "lucide-react-native"
import { useMemo, useState } from "react"
import { Alert, Pressable, ScrollView, View } from "react-native"
import { DropdownList } from "../../../src/components/dropdown-list"
import { FilterChip } from "../../../src/components/filter-chip"
import { PersonCard } from "../../../src/components/person-card"
import { PersonGridCard } from "../../../src/components/person-grid-card"
import { ScopeChip } from "../../../src/components/scope-chip"
import { ViewToggle } from "../../../src/components/view-toggle"
import { api } from "../../../src/lib/api"
import { useStoredView } from "../../../src/lib/use-stored-view"

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
		<Pressable
			onPress={() =>
				Alert.alert(
					"Overnight check-in",
					"Some folks check in again after midnight, so they may not actually be in the hub yet.",
				)
			}
			className="flex-row items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5"
			hitSlop={6}
		>
			<Moon size={11} color="#A5B4FC" />
			<Text className="text-[11px] font-medium text-indigo-300">Overnight</Text>
		</Pressable>
	)
}

export default function HubScreen() {
	const router = useRouter()
	const queryClient = useQueryClient()

	const { data: checkInStatus } = useQuery(api.isCheckedIn.queryOptions({}))

	const {
		data: hub,
		isLoading: hubIsLoading,
		error: hubError,
	} = useQuery(api.hubVisits.queryOptions({}))

	const isCheckedInQueryKey = api.isCheckedIn.queryOptions({}).queryKey
	const hubQueryKey = api.hubVisits.queryOptions({}).queryKey
	const checkin = useMutation({
		...api.hubCheckin.mutationOptions({}),
		onSuccess: () => {
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
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-6"
		>
			<View className="flex-row items-center justify-between">
				<View className="gap-1">
					<Text className="text-sm text-text-tertiary">Currently at RC</Text>
					<Text className="text-2xl font-semibold">In the Hub</Text>
				</View>
				{visitors && (
					<View className="flex-row items-center gap-1.5 rounded-full bg-cyan/10 px-3.5 py-1.5">
						<View className="h-2 w-2 rounded-full bg-cyan" />
						<Text className="text-[13px] font-medium text-primary">
							{mainList.length} {mainList.length === 1 ? "person" : "people"}
						</Text>
					</View>
				)}
			</View>

			{checkInStatus && !isCheckedIn && (
				<Pressable
					className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-cyan"
					onPress={() => checkin.mutate({})}
					disabled={checkin.isPending}
				>
					<MapPin size={18} color="#0A0F1C" />
					<Text className="text-[15px] font-semibold text-background">
						{checkin.isPending ? "Checking in..." : "Check in to the Hub"}
					</Text>
				</Pressable>
			)}

			{checkInStatus && isCheckedIn && (
				<View className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-cyan/20 bg-cyan/10">
					<CheckCircle size={18} color="#22D3EE" />
					<Text className="text-sm font-medium text-primary">
						You're checked in
					</Text>
				</View>
			)}

			{hubIsLoading && (
				<View className="flex-1 items-center justify-center py-20">
					<Text className="text-sm text-text-tertiary">Loading...</Text>
				</View>
			)}

			{hubError && (
				<View className="flex-1 items-center justify-center py-20">
					<Text className="text-sm text-destructive">
						Failed to load hub visits
					</Text>
				</View>
			)}

			{visitors && visitors.length === 0 && (
				<View className="flex-1 items-center justify-center gap-3 py-20">
					<Users size={48} color="#475569" />
					<Text className="text-sm text-text-tertiary">
						Nobody is in the hub right now
					</Text>
				</View>
			)}

			{visitors && visitors.length > 0 && (
				<View className="gap-3">
					<View className="flex-row flex-wrap items-center gap-2">
						<FilterChip
							icon={ArrowUpDown}
							label={currentSortLabel}
							active={false}
							onPress={() => setSortOpen((o) => !o)}
						/>
						{overnightCount > 0 && (
							<ScopeChip
								label={
									showOvernight
										? `Hide ${overnightCount} overnight`
										: `Show ${overnightCount} overnight`
								}
								active={showOvernight}
								onPress={() => setShowOvernight((s) => !s)}
							/>
						)}
						<ViewToggle view={view} onSetView={setView} />
					</View>
					{sortOpen && (
						<DropdownList
							items={SORT_OPTIONS}
							isLoading={false}
							onSelect={(opt) => {
								setSortKey(opt.key)
								setSortOpen(false)
							}}
							activeValue={currentSortLabel}
						/>
					)}
					{mainList.length === 0 ? (
						<View className="flex-1 items-center justify-center gap-3 py-20">
							<Moon size={48} color="#475569" />
							<Text className="text-sm text-text-tertiary">
								Only overnight check-ins so far
							</Text>
						</View>
					) : view === "grid" ? (
						<View className="flex-row flex-wrap -mx-1">
							{mainList.map((visit) => (
								<View key={visit.personId} className="w-1/2 px-1 pb-2">
									<PersonGridCard
										name={visit.name}
										imageUrl={visit.imageUrl}
										batch={visit.batch}
										stintType={visit.stintType}
										badge={
											overnightIds.has(visit.personId) ? (
												<OvernightBadge />
											) : null
										}
										onPress={() =>
											router.push(`/(app)/member/${visit.personId}`)
										}
									/>
								</View>
							))}
						</View>
					) : (
						<View className="gap-2.5">
							{mainList.map((visit) => (
								<PersonCard
									key={visit.personId}
									name={visit.name}
									imageUrl={visit.imageUrl}
									batch={visit.batch}
									stintType={visit.stintType}
									badge={
										overnightIds.has(visit.personId) ? <OvernightBadge /> : null
									}
									onPress={() => router.push(`/(app)/member/${visit.personId}`)}
								/>
							))}
						</View>
					)}
				</View>
			)}
		</ScrollView>
	)
}
