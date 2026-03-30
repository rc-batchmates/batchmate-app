import { DoorControls, ZoomLinks } from "@batchmate/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { User } from "lucide-react"
import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { api } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth"

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession()
		if (!session) {
			throw redirect({ to: "/login" })
		}
	},
	component: HomePage,
})

function HomePage() {
	const { data: session } = useSession()
	const {
		data: health,
		isLoading,
		error,
	} = useQuery(api.health.queryOptions({}))

	const [pendingDoor, setPendingDoor] = useState<{
		floor: "4" | "5"
		entry: "elevator" | "stairs"
	} | null>(null)

	const openDoor = useMutation({
		...api.doorsOpen.mutationOptions({}),
		onMutate: (input) => setPendingDoor(input),
		onSettled: () => setPendingDoor(null),
	})

	return (
		<PageLayout
			subtitle="Welcome back,"
			title={session?.user?.name?.split(" ")[0] ?? "Recurser"}
			headerRight={
				<Link
					to="/profile"
					className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-card"
				>
					{session?.user?.image ? (
						<img
							src={session.user.image}
							alt=""
							className="h-full w-full object-cover"
						/>
					) : (
						<User size={22} color="#22D3EE" />
					)}
				</Link>
			}
		>
			{/* API Status */}
			<div className="flex items-center gap-2.5 rounded-lg bg-card px-4 py-3">
				<div
					className={`h-2 w-2 rounded-full ${error ? "bg-destructive" : "bg-cyan"}`}
				/>
				<span className="font-mono text-xs font-medium text-cyan">
					{isLoading
						? "Connecting..."
						: error
							? "Disconnected"
							: "API Connected"}
				</span>
				{health?.timestamp && (
					<span className="font-mono text-[11px] text-text-muted">
						{health.timestamp}
					</span>
				)}
			</div>

			{/* Door Controls */}
			<DoorControls
				onOpenDoor={(floor, entry) => openDoor.mutate({ floor, entry })}
				isPending={openDoor.isPending}
				pendingDoor={pendingDoor}
			/>

			{/* Zoom Rooms */}
			<ZoomLinks />
		</PageLayout>
	)
}
