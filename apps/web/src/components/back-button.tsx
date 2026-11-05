import { useRouter } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"

export function BackButton() {
	const router = useRouter()
	return (
		<button
			type="button"
			onClick={() =>
				router.history.canGoBack()
					? router.history.back()
					: router.navigate({ to: "/" })
			}
			className="flex cursor-pointer items-center gap-1 text-sm text-text-tertiary hover:text-foreground"
		>
			<ChevronLeft size={14} className="text-text-tertiary" />
			Back
		</button>
	)
}
