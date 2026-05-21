import { type PresentationItem, PresentationsList } from "@batchmate/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { PageLayout } from "@/components/page-layout"
import { api } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth"

export const Route = createFileRoute("/presentations")({
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession()
		if (!session) {
			throw redirect({ to: "/login" })
		}
	},
	component: PresentationsPage,
})

function PresentationsPage() {
	const { data: session } = useSession()
	const queryClient = useQueryClient()
	const presentationsQuery = useQuery(api.presentationsList.queryOptions({}))
	const presentationsKey = api.presentationsList.queryOptions({}).queryKey

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: presentationsKey })

	const create = useMutation({
		...api.presentationsCreate.mutationOptions({}),
		onSuccess: invalidate,
	})
	const update = useMutation({
		...api.presentationsUpdate.mutationOptions({}),
		onSuccess: invalidate,
	})
	const remove = useMutation({
		...api.presentationsDelete.mutationOptions({}),
		onSuccess: invalidate,
	})

	function handleDelete(item: PresentationItem) {
		if (
			window.confirm(
				`Delete "${item.title || "Untitled"}" by ${item.presenter}?`,
			)
		) {
			remove.mutate({ id: item.id })
		}
	}

	return (
		<PageLayout subtitle="This week" title="Presentations" className="gap-6">
			<PresentationsList
				sessionStartMs={presentationsQuery.data?.sessionStartMs ?? null}
				presentations={presentationsQuery.data?.presentations ?? []}
				maxSignUps={presentationsQuery.data?.maxSignUps}
				defaultPresenterName={session?.user?.name ?? ""}
				isLoading={presentationsQuery.isLoading}
				hasError={!!presentationsQuery.error}
				onCreate={(input) => create.mutate(input)}
				onUpdate={(input) => update.mutate(input)}
				onDelete={handleDelete}
				isCreating={create.isPending}
				isUpdating={update.isPending}
			/>
		</PageLayout>
	)
}
