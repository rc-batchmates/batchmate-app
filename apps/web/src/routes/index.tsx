import { type DoorAction, DoorControls, ZoomLinks } from "@batchmate/ui"
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
	const { error } = useQuery(api.health.queryOptions({}))
	const { data: zoomRooms } = useQuery(api.zoomRooms.queryOptions({}))

	const [pendingAction, setPendingAction] = useState<DoorAction | null>(null)
	const [justUnlocked, setJustUnlocked] = useState<DoorAction | null>(null)

	const zoomDirectUrls = zoomRooms
		? Object.fromEntries(zoomRooms.map((r) => [r.slug, r.directUrl]))
		: undefined

	const openDoor = useMutation({
		...api.doorsOpen.mutationOptions({}),
		onSuccess: (_, input) => setJustUnlocked(input as DoorAction),
		onSettled: () => setPendingAction(null),
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
			{/* API Status — only show when there's an error */}
			{error && (
				<div className="flex items-center gap-2.5 rounded-lg bg-card px-4 py-3">
					<div className="h-2 w-2 rounded-full bg-destructive" />
					<span className="font-mono text-xs font-medium text-destructive">
						Disconnected
					</span>
				</div>
			)}

			{/* Door Controls */}
			<DoorControls
				onOpenDoor={(action) => {
					setPendingAction(action)
					openDoor.mutate(action)
				}}
				isPending={openDoor.isPending}
				pendingAction={pendingAction}
				justUnlockedAction={justUnlocked}
				onUnlockEnd={() => setJustUnlocked(null)}
			/>

			{/* Zoom Rooms */}
			<ZoomLinks directUrls={zoomDirectUrls} />
		</PageLayout>
	)
}
