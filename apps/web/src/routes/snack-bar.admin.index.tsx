import {
	SnackBarAccounts,
	SnackBarExport,
	SnackBarSkuManager,
} from "@batchmate/ui"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { BackButton } from "@/components/back-button"
import { PageLayout } from "@/components/page-layout"
import { api } from "@/lib/api"
import { requireSession } from "@/lib/require-session"

const TABS = [
	{ id: "accounts", label: "Accounts" },
	{ id: "snacks", label: "Snacks" },
	{ id: "export", label: "Export" },
] as const

type Tab = (typeof TABS)[number]["id"]

export const Route = createFileRoute("/snack-bar/admin/")({
	beforeLoad: requireSession,
	validateSearch: (search: Record<string, unknown>): { tab?: Tab } =>
		TABS.some((t) => t.id === search.tab) ? { tab: search.tab as Tab } : {},
	component: SnackBarAdminPage,
})

function downloadCsv({ filename, csv }: { filename: string; csv: string }) {
	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
	const a = document.createElement("a")
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
	return Promise.resolve()
}

function SnackBarAdminPage() {
	const navigate = useNavigate()
	const { tab = "accounts" } = Route.useSearch()
	const summary = useQuery(api.snackBarSummary.queryOptions({}))

	return (
		<PageLayout title="Snack Bar admin" subtitle={<BackButton />}>
			{summary.isLoading ? (
				<span className="text-sm text-text-tertiary">Loading...</span>
			) : !summary.data?.isAdmin ? (
				<span className="text-sm text-text-tertiary">
					Only Snack Bar admins can see this page.
				</span>
			) : (
				<>
					<div className="flex gap-2">
						{TABS.map((t) => (
							<Link
								key={t.id}
								to="/snack-bar/admin"
								search={{ tab: t.id }}
								replace
								className={`rounded-full border px-3 py-1.5 text-xs font-semibold no-underline ${
									tab === t.id
										? "border-cyan bg-cyan/10 text-cyan"
										: "border-cyan/20 bg-surface-inset text-text-secondary"
								}`}
							>
								{t.label}
							</Link>
						))}
					</div>

					{tab === "accounts" && (
						<SnackBarAccounts
							api={api}
							onSelectAccount={(account) =>
								navigate({
									to: "/snack-bar/admin/account/$userId",
									params: { userId: account.userId },
								})
							}
						/>
					)}
					{tab === "snacks" && (
						<SnackBarSkuManager
							api={api}
							header={
								<span className="text-xs text-text-tertiary">
									Writing and identifying NFC tags is done from the batchmate
									mobile app.
								</span>
							}
						/>
					)}
					{tab === "export" && (
						<SnackBarExport api={api} onExport={downloadCsv} />
					)}
				</>
			)}
		</PageLayout>
	)
}
