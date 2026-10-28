import { Text } from "@batchmate/ui"
import { useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { ActivityIndicator } from "react-native"
import { api } from "../lib/api"

// The API enforces admin access; this just avoids showing admins-only UI
// that would fail on every request.
export function SnackBarAdminGate({ children }: { children: ReactNode }) {
	const summary = useQuery(api.snackBarSummary.queryOptions({}))
	if (summary.isLoading) return <ActivityIndicator color="#22D3EE" />
	if (!summary.data?.isAdmin) {
		return (
			<Text className="text-center text-sm text-text-tertiary">
				Only Snack Bar admins can see this page.
			</Text>
		)
	}
	return children
}
