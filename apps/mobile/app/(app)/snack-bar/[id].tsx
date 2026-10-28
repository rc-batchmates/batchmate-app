import { SnackBarEntryDetail, Text } from "@batchmate/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocalSearchParams } from "expo-router"
import { ActivityIndicator, ScrollView } from "react-native"
import { BackHeader } from "../../../src/components/back-header"
import { api } from "../../../src/lib/api"
import { invalidateSnackBar } from "../../../src/lib/snack-bar"

export default function SnackBarEntryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const queryClient = useQueryClient()
	const entry = useQuery(
		api.snackBarTransaction.queryOptions({ input: { id } }),
	)
	const voidEntry = useMutation({
		...api.snackBarVoid.mutationOptions(),
		onSuccess: () => invalidateSnackBar(queryClient),
	})

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-6"
		>
			<BackHeader title="Transaction" />
			{entry.isLoading ? (
				<ActivityIndicator color="#22D3EE" />
			) : entry.data ? (
				<SnackBarEntryDetail
					entry={entry.data}
					onVoid={() => voidEntry.mutate({ id })}
					isVoiding={voidEntry.isPending}
					errorMessage={voidEntry.error?.message}
				/>
			) : (
				<Text className="text-center text-sm text-destructive">
					Couldn't find that transaction.
				</Text>
			)}
		</ScrollView>
	)
}
