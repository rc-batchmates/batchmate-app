import { AVATAR_FACE_OBJECT_POSITION, getSubtitle } from "@batchmate/ui"
import { User, X } from "lucide-react"
import { useEffect } from "react"

export function PhotoPeek({
	open,
	onClose,
	name,
	imageUrl,
	batch,
	stintType,
}: {
	open: boolean
	onClose: () => void
	name: string
	imageUrl: string | null
	batch: string | null
	stintType?: string | null
}) {
	useEffect(() => {
		if (!open) return
		function handler(e: KeyboardEvent) {
			if (e.key === "Escape") onClose()
		}
		document.addEventListener("keydown", handler)
		return () => document.removeEventListener("keydown", handler)
	}, [open, onClose])

	if (!open) return null

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label={`${name} photo`}
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onClose()
			}}
			className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/90 px-6 py-12"
		>
			<button
				type="button"
				onClick={onClose}
				className="absolute top-6 right-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 text-white"
				aria-label="Close"
			>
				<X size={22} />
			</button>
			<div className="flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl bg-card">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={name}
						className="h-full w-full object-cover"
						style={{ objectPosition: AVATAR_FACE_OBJECT_POSITION }}
					/>
				) : (
					<User size={120} color="#22D3EE" />
				)}
			</div>
			<div className="flex flex-col items-center gap-1.5">
				<span className="text-center text-2xl font-semibold text-white">
					{name}
				</span>
				<span className="text-center font-mono text-sm text-text-tertiary">
					{getSubtitle(batch, stintType ?? null)}
				</span>
			</div>
		</div>
	)
}
