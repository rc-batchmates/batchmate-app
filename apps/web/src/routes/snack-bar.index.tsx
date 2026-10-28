import {
	SnackBarBalance,
	SnackBarEntryList,
	SnackBarSettleUp,
} from "@batchmate/ui"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ShieldCheck } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { PageLayout } from "@/components/page-layout"
import { api } from "@/lib/api"
import { requireSession } from "@/lib/require-session"

export const Route = createFileRoute("/snack-bar/")({
	beforeLoad: requireSession,
	component: SnackBarPage,
})

function SnackBarPage() {
	const navigate = useNavigate()
	const summary = useQuery(api.snackBarSummary.queryOptions({}))
	const history = useInfiniteQuery(
		api.snackBarTransactions.infiniteOptions({
			input: (cursor: string | undefined) => ({ cursor }),
			initialPageParam: undefined,
			getNextPageParam: (page) => page.nextCursor ?? undefined,
		}),
	)
	const entries = history.data?.pages.flatMap((page) => page.entries) ?? []

	return (
		<PageLayout title="Snack Bar" subtitle={<BackButton />}>
			<SnackBarBalance balanceCents={summary.data?.balanceCents} />

			<SnackBarSettleUp />

			{summary.data?.isAdmin && (
				<Link
					to="/snack-bar/admin"
					className="flex items-center gap-2.5 rounded-xl bg-card px-4 py-3 no-underline hover:bg-card/80"
				>
					<ShieldCheck size={18} color="#22D3EE" />
					<span className="flex-1 text-[15px] font-semibold text-foreground">
						Admin
					</span>
					<span className="text-xs font-medium text-cyan">→</span>
				</Link>
			)}

			{history.isLoading ? (
				<span className="text-center text-sm text-text-tertiary">
					Loading...
				</span>
			) : history.error ? (
				<span className="text-center text-sm text-destructive">
					Couldn't load your history.
				</span>
			) : (
				<SnackBarEntryList
					entries={entries}
					onSelectEntry={(entry) =>
						navigate({ to: "/snack-bar/$id", params: { id: entry.id } })
					}
				/>
			)}

			{history.hasNextPage && (
				<button
					type="button"
					disabled={history.isFetchingNextPage}
					onClick={() => history.fetchNextPage()}
					className="h-10 cursor-pointer rounded-md border border-cyan/40 bg-surface-inset text-sm font-semibold text-cyan disabled:opacity-50"
				>
					{history.isFetchingNextPage ? "Loading..." : "Load more"}
				</button>
			)}
		</PageLayout>
	)
}
