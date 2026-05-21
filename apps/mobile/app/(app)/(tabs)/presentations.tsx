import { type PresentationItem, PresentationsList, Text } from "@batchmate/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { api } from "../../../src/lib/api"
import { useSession } from "../../../src/lib/auth"

export default function PresentationsScreen() {
	const { data: session } = useSession()
	const queryClient = useQueryClient()
	const presentationsQuery = useQuery(api.presentationsList.queryOptions({}))
	const presentationsKey = api.presentationsList.queryOptions({}).queryKey

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: presentationsKey })

	const create = useMutation({
		...api.presentationsCreate.mutationOptions({}),
		onSuccess: invalidate,
		onError: () => Alert.alert("Could not add presentation"),
	})

	const update = useMutation({
		...api.presentationsUpdate.mutationOptions({}),
		onSuccess: invalidate,
		onError: () => Alert.alert("Could not update presentation"),
	})

	const remove = useMutation({
		...api.presentationsDelete.mutationOptions({}),
		onSuccess: invalidate,
		onError: () => Alert.alert("Could not delete presentation"),
	})

	function handleDelete(item: PresentationItem) {
		Alert.alert(
			"Delete presentation?",
			`${item.title || "Untitled"} — ${item.presenter}`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => remove.mutate({ id: item.id }),
				},
			],
		)
	}

	return (
		<KeyboardAwareScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-6"
			keyboardShouldPersistTaps="handled"
			enableOnAndroid
			extraScrollHeight={24}
		>
			<View className="gap-1">
				<Text className="text-sm text-text-tertiary">This week</Text>
				<Text className="text-2xl font-semibold">Presentations</Text>
			</View>
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
		</KeyboardAwareScrollView>
	)
}
