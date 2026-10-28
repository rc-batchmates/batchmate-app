import { SnackBarBalance, SnackBarEntryList, Text } from "@batchmate/ui"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import { Nfc, ShieldCheck } from "lucide-react-native"
import { useState } from "react"
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	ScrollView,
	View,
} from "react-native"
import { BackHeader } from "../../../src/components/back-header"
import { api } from "../../../src/lib/api"

export default function SnackBarScreen() {
	const router = useRouter()
	const summary = useQuery(api.snackBarSummary.queryOptions({}))
	const history = useInfiniteQuery(
		api.snackBarTransactions.infiniteOptions({
			input: (cursor: string | undefined) => ({ cursor }),
			initialPageParam: undefined,
			getNextPageParam: (page) => page.nextCursor ?? undefined,
		}),
	)
	const [refreshing, setRefreshing] = useState(false)

	const entries = history.data?.pages.flatMap((page) => page.entries) ?? []

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-6"
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					tintColor="#22D3EE"
					onRefresh={async () => {
						setRefreshing(true)
						await Promise.all([summary.refetch(), history.refetch()])
						setRefreshing(false)
					}}
				/>
			}
			scrollEventThrottle={200}
			onScroll={({ nativeEvent }) => {
				const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
				const nearEnd =
					layoutMeasurement.height + contentOffset.y > contentSize.height - 400
				if (nearEnd && history.hasNextPage && !history.isFetchingNextPage) {
					history.fetchNextPage()
				}
			}}
		>
			<BackHeader title="Snack Bar" />

			<SnackBarBalance balanceCents={summary.data?.balanceCents} />

			<View className="flex-row items-center gap-3 rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3">
				<Nfc size={18} color="#22D3EE" />
				<Text className="flex-1 text-xs text-text-secondary">
					Tap your phone on a snack's tag to add it to your tab. Pay a Snack Bar
					admin to settle up.
				</Text>
			</View>

			{summary.data?.isAdmin && (
				<Pressable
					className="flex-row items-center gap-2.5 rounded-xl bg-card px-4 py-3"
					onPress={() => router.push("/snack-bar/admin")}
				>
					<ShieldCheck size={18} color="#22D3EE" />
					<Text className="flex-1 text-[15px] font-semibold">Admin</Text>
					<Text className="text-xs font-medium text-primary">→</Text>
				</Pressable>
			)}

			{history.isLoading ? (
				<ActivityIndicator color="#22D3EE" />
			) : history.error ? (
				<Text className="text-center text-sm text-destructive">
					Couldn't load your history.
				</Text>
			) : (
				<SnackBarEntryList
					entries={entries}
					onSelectEntry={(entry) => router.push(`/snack-bar/${entry.id}`)}
				/>
			)}

			{history.isFetchingNextPage && <ActivityIndicator color="#22D3EE" />}
		</ScrollView>
	)
}
