import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { LegacyDomainBanner } from "@/components/legacy-domain-banner"

const queryClient = new QueryClient()

export const Route = createRootRoute({
	component: () => (
		<QueryClientProvider client={queryClient}>
			<LegacyDomainBanner />
			<Outlet />
		</QueryClientProvider>
	),
})
