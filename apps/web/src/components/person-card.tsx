import { getInitials, getSubtitle } from "@batchmate/ui"
import { Link } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import type { ReactNode } from "react"

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
			className="flex items-center gap-3.5 rounded-xl bg-card px-4 py-3.5 no-underline transition-colors hover:bg-card/80"
		>
			<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-inset">
				{imageUrl ? (
					<img src={imageUrl} alt="" className="h-full w-full object-cover" />
				) : (
					<span className="text-sm font-semibold text-cyan">
						{getInitials(name)}
					</span>
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="text-[15px] font-medium text-foreground">{name}</span>
				<span className="text-xs text-text-tertiary">
					{getSubtitle(batch, stintType ?? null)}
				</span>
			</div>
			{badge}
			<ChevronRight size={20} color="#475569" />
		</Link>
	)
}
