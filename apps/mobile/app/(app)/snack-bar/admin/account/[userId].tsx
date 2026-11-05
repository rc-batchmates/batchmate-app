import { SnackBarAccountDetail } from "@batchmate/ui"
import { useLocalSearchParams } from "expo-router"
import { ScrollView } from "react-native"
import { BackHeader } from "../../../../../src/components/back-header"
import { SnackBarAdminGate } from "../../../../../src/components/snack-bar-admin-gate"
import { api } from "../../../../../src/lib/api"

export default function SnackBarAccountScreen() {
	const { userId } = useLocalSearchParams<{ userId: string }>()
	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-6"
			keyboardShouldPersistTaps="handled"
		>
			<BackHeader title="Account" />
			<SnackBarAdminGate>
				<SnackBarAccountDetail api={api} userId={userId} />
			</SnackBarAdminGate>
		</ScrollView>
	)
}
