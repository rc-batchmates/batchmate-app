import { SnackBarAccountDetail } from "@batchmate/ui"
import { createFileRoute } from "@tanstack/react-router"
import { BackButton } from "@/components/back-button"
import { PageLayout } from "@/components/page-layout"
import { api } from "@/lib/api"
import { requireSession } from "@/lib/require-session"

export const Route = createFileRoute("/snack-bar/admin/account/$userId")({
	beforeLoad: requireSession,
	component: SnackBarAccountPage,
})

function SnackBarAccountPage() {
	const { userId } = Route.useParams()
	return (
		<PageLayout title="Account" subtitle={<BackButton />}>
			<SnackBarAccountDetail api={api} userId={userId} />
		</PageLayout>
	)
}
