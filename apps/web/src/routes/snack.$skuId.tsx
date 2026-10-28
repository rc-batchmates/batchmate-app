import { newSnackLinkKey, SnackPurchaseSummary } from "@batchmate/ui"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { PageLayout } from "@/components/page-layout"
import { api } from "@/lib/api"
import { requireSession } from "@/lib/require-session"

// What a Snack Bar NFC tag opens (https://batchmate.app/snack/<skuId>) when
// the app doesn't catch it. See SNACK_LINK_KEY_PARAM in @batchmate/ui for
// how `?k=` keeps reloads from buying twice.
export const Route = createFileRoute("/snack/$skuId")({
	validateSearch: (search: Record<string, unknown>): { k?: string } =>
		typeof search.k === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(search.k)
			? { k: search.k }
			: {},
	beforeLoad: async ({ params, search, location }) => {
		// The key comes first, before the login check, so a link that bounces
		// through OAuth still lands back on the same key.
		if (!search.k) {
			throw redirect({
				to: "/snack/$skuId",
				params,
				search: { k: newSnackLinkKey() },
				replace: true,
			})
		}
		await requireSession({ location })
	},
	component: SnackPurchasePage,
})

function SnackPurchasePage() {
	const { skuId } = Route.useParams()
	const { k } = Route.useSearch()
	const navigate = useNavigate()

	return (
		<PageLayout title="Snack Bar">
			{k && (
				<SnackPurchaseSummary
					key={k}
					api={api}
					skuId={skuId}
					idempotencyKey={k}
					source="web"
					onViewTab={() => navigate({ to: "/snack-bar" })}
				/>
			)}
		</PageLayout>
	)
}
