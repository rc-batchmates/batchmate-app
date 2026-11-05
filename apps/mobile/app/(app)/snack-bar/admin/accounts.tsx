import { SnackBarAccounts } from "@batchmate/ui"
import { useRouter } from "expo-router"
import { ScrollView } from "react-native"
import { BackHeader } from "../../../../src/components/back-header"
import { SnackBarAdminGate } from "../../../../src/components/snack-bar-admin-gate"
import { api } from "../../../../src/lib/api"

export default function SnackBarAccountsScreen() {
	const router = useRouter()
	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-6"
		>
			<BackHeader title="Accounts" />
			<SnackBarAdminGate>
				<SnackBarAccounts
					api={api}
					onSelectAccount={(account) =>
						router.push(`/snack-bar/admin/account/${account.userId}`)
					}
				/>
			</SnackBarAdminGate>
		</ScrollView>
	)
}
