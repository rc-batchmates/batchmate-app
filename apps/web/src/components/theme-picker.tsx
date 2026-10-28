import {
	type ThemePreference,
	useThemePreference,
} from "@/lib/theme-preference"

const OPTIONS: { value: ThemePreference; label: string }[] = [
	{ value: "system", label: "System" },
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
]

export function ThemePicker() {
	const [pref, setPref] = useThemePreference()

	return (
		<fieldset className="m-0 min-w-0 border-0 p-0">
			<legend className="mb-3 p-0 font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
				APPEARANCE
			</legend>
			<div className="flex gap-1 rounded-xl bg-card p-1 md:w-80">
				{OPTIONS.map((o) => {
					const selected = pref === o.value
					return (
						<button
							key={o.value}
							type="button"
							aria-pressed={selected}
							onClick={() => setPref(o.value)}
							className={`flex-1 cursor-pointer rounded-lg border-0 py-2 text-sm font-medium ${
								selected
									? "bg-cyan/15 text-primary"
									: "bg-transparent text-text-secondary"
							}`}
						>
							{o.label}
						</button>
					)
				})}
			</div>
		</fieldset>
	)
}
