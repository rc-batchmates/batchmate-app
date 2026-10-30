import { SnackBarEntryDetail } from "@batchmate/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { BackButton } from "@/components/back-button"
import { PageLayout } from "@/components/page-layout"
import { api } from "@/lib/api"
import { requireSession } from "@/lib/require-session"

export const Route = createFileRoute("/snack-bar/$id")({
	beforeLoad: requireSession,
	component: SnackBarEntryPage,
})

function SnackBarEntryPage() {
	const { id } = Route.useParams()
	const queryClient = useQueryClient()
	const entry = useQuery(
		api.snackBarTransaction.queryOptions({ input: { id } }),
	)
	const voidEntry = useMutation({
		...api.snackBarVoid.mutationOptions(),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: api.key() }),
	})

	return (
		<PageLayout title="Transaction" subtitle={<BackButton />}>
			{entry.isLoading ? (
				<span className="text-sm text-text-tertiary">Loading...</span>
			) : entry.data ? (
				<SnackBarEntryDetail
					entry={entry.data}
					onVoid={() => voidEntry.mutate({ id })}
					isVoiding={voidEntry.isPending}
					errorMessage={voidEntry.error?.message}
				/>
			) : (
				<span className="text-sm text-destructive">
					Couldn't find that transaction.
				</span>
			)}
		</PageLayout>
	)
}
