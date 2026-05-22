import { StudyFacesGame, type StudyFacesStorage } from "@batchmate/ui"
import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
} from "@tanstack/react-router"
import { ChevronLeft, User } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { api } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth"

const webStorage: StudyFacesStorage = {
	read<T>(key: string, fallback: T): T {
		if (typeof window === "undefined") return fallback
		try {
			const raw = window.localStorage.getItem(key)
			if (!raw) return fallback
			return JSON.parse(raw) as T
		} catch {
			return fallback
		}
	},
	write(key: string, value: unknown) {
		if (typeof window === "undefined") return
		try {
			window.localStorage.setItem(key, JSON.stringify(value))
		} catch {
			// quota / disabled storage — silently ignore
		}
	},
	remove(key: string) {
		if (typeof window === "undefined") return
		try {
			window.localStorage.removeItem(key)
		} catch {
			// silently ignore
		}
	},
}

export const Route = createFileRoute("/study-faces")({
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession()
		if (!session) {
			throw redirect({ to: "/login" })
		}
	},
	component: StudyFacesPage,
})

function StudyFacesPage() {
	const router = useRouter()
	const { data: session } = useSession()
	const sessionUser = session?.user as { rcId?: string } | undefined
	const userRcId = sessionUser?.rcId
		? Number.parseInt(sessionUser.rcId, 10)
		: undefined

	return (
		<PageLayout
			className="gap-4 md:gap-5"
			title="Study faces"
			subtitle={
				<button
					type="button"
					onClick={() => router.history.back()}
					className="flex cursor-pointer items-center gap-1 text-sm text-text-tertiary hover:text-foreground"
				>
					<ChevronLeft size={14} color="#64748B" />
					Back
				</button>
			}
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
			<StudyFacesGame api={api} userRcId={userRcId} storage={webStorage} />
		</PageLayout>
	)
}
