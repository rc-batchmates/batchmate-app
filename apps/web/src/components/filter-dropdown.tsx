import { ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function FilterDropdown<T extends { id: number; name: string }>({
	icon: Icon,
	label,
	active,
	items,
	isLoading,
	open,
	onToggle,
	onSelect,
	onClear,
	clearable = true,
}: {
	icon: React.ComponentType<{ size: number; color: string }>
	label: string
	active: boolean
	items: T[]
	isLoading: boolean
	open: boolean
	onToggle: () => void
	onSelect: (item: T) => void
	onClear?: () => void
	clearable?: boolean
}) {
	const ref = useRef<HTMLDivElement>(null)
	const onToggleRef = useRef(onToggle)
	onToggleRef.current = onToggle
	const [search, setSearch] = useState("")

	useEffect(() => {
		if (!open) return
		setSearch("")
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onToggleRef.current()
			}
		}
		document.addEventListener("mousedown", handleClick)
		return () => document.removeEventListener("mousedown", handleClick)
	}, [open])

	const filtered = items.filter((item) =>
		item.name.toLowerCase().includes(search.toLowerCase()),
	)

	const handleClick = clearable && active && onClear ? onClear : onToggle

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={handleClick}
				className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
					active
						? "border-cyan/30 bg-cyan/10 text-cyan"
						: "border-border bg-card text-text-secondary hover:bg-card/80"
				}`}
			>
				<Icon size={14} color={active ? "#22D3EE" : "#94A3B8"} />
				<span>{label}</span>
				<ChevronDown size={14} color={active ? "#22D3EE" : "#64748B"} />
			</button>
			{open && (
				<div className="absolute top-full left-0 z-50 mt-1 max-h-64 w-64 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
					<div className="border-b border-border p-2">
						<input
							type="text"
							placeholder="Search..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full rounded-md bg-card px-3 py-1.5 text-sm text-foreground outline-none placeholder:text-text-tertiary"
							// biome-ignore lint/a11y/noAutofocus: dropdown search should focus on open
							autoFocus
						/>
					</div>
					<div className="max-h-48 overflow-y-auto p-1">
						{isLoading && (
							<div className="px-3 py-2 text-sm text-text-tertiary">
								Loading...
							</div>
						)}
						{!isLoading && filtered.length === 0 && (
							<div className="px-3 py-2 text-sm text-text-tertiary">
								No results
							</div>
						)}
						{filtered.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => onSelect(item)}
								className="w-full cursor-pointer rounded-md px-3 py-1.5 text-left text-sm text-foreground hover:bg-card"
							>
								{item.name}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
