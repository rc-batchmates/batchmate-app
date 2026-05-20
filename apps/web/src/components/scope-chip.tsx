export function ScopeChip({
	label,
	active,
	onClick,
}: {
	label: string
	active: boolean
	onClick: () => void
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
				active
					? "border-cyan/30 bg-cyan/10 text-cyan"
					: "border-border bg-card text-text-secondary hover:bg-card/80"
			}`}
		>
			{active && <div className="h-1.5 w-1.5 rounded-full bg-cyan" />}
			<span>{label}</span>
		</button>
	)
}
