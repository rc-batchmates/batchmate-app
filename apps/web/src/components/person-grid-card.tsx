import { getSubtitle } from "@batchmate/ui"
import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { Avatar } from "./avatar"

export function PersonGridCard({
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
			className="flex flex-col items-center gap-2.5 rounded-2xl bg-card p-3 no-underline transition-colors hover:bg-card/80"
		>
			<Avatar imageUrl={imageUrl} name={name} size="xl" />
			<div className="flex w-full flex-col items-center gap-1">
				<span className="line-clamp-1 text-center text-sm font-medium text-foreground">
					{name}
				</span>
				<span className="line-clamp-1 text-center text-[11px] text-text-tertiary">
					{getSubtitle(batch, stintType ?? null)}
				</span>
				{badge}
			</div>
		</Link>
	)
}
