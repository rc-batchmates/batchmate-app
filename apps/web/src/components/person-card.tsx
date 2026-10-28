import { getSubtitle } from "@batchmate/ui"
import { Link } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import type { ReactNode } from "react"
import { Avatar } from "./avatar"

export function PersonCard({
	personId,
	name,
	imageUrl,
	batch,
	stintType,
	badge,
}: {
	personId: number
	name: string
	imageUrl: string | null
	batch: string | null
	stintType?: string | null
	badge?: ReactNode
}) {
	return (
		<Link
			to="/member/$id"
			params={{ id: String(personId) }}
			className="flex items-center gap-3.5 rounded-xl bg-card px-4 py-3 no-underline transition-colors hover:bg-card/80"
		>
			<Avatar imageUrl={imageUrl} name={name} size="md" />
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<span className="text-[15px] font-medium text-foreground">{name}</span>
				<span className="text-xs text-text-tertiary">
					{getSubtitle(batch, stintType ?? null)}
				</span>
			</div>
			{badge}
			<ChevronRight size={20} className="text-text-muted" />
		</Link>
	)
}
