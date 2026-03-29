import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	DoorControls,
	Text,
} from "@batchmate/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { api } from "@/lib/api"
import { authClient, signOut, useSession } from "@/lib/auth"

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
	const navigate = useNavigate()
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

	async function handleSignOut() {
		await signOut()
		navigate({ to: "/login" })
	}

	return (
		<div className="mx-auto max-w-2xl p-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold">batchmate.app</h1>
				<Button variant="outline" onPress={handleSignOut}>
					<Text>Sign out</Text>
				</Button>
			</div>

			<div className="mb-6">
				<DoorControls
					onOpenDoor={(floor, entry) => openDoor.mutate({ floor, entry })}
					isPending={openDoor.isPending}
					pendingDoor={pendingDoor}
				/>
			</div>

			{session?.user && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>
							<Text>User</Text>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							<span className="font-medium">Name:</span> {session.user.name}
						</p>
						<p>
							<span className="font-medium">Email:</span> {session.user.email}
						</p>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>
						<Text>API Health</Text>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading && <p className="text-muted-foreground">Loading...</p>}
					{error && <p className="text-destructive">Error: {error.message}</p>}
					{health && (
						<pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
							{JSON.stringify(health, null, 2)}
						</pre>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
