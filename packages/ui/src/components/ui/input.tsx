import type * as React from "react"
import { TextInput } from "react-native"

import { cn } from "../../lib/cn"
import { useThemeColors } from "../../lib/theme-colors"

function Input({
	className,
	placeholderClassName,
	editable,
	...props
}: React.ComponentPropsWithoutRef<typeof TextInput> & {
	placeholderClassName?: string
}) {
	const c = useThemeColors()
	return (
		<TextInput
			// Height comes from the text itself plus padding. No fixed height and
			// no line-height: Android's TextInput clips glyphs whenever an explicit
			// line-height is shorter than the font's own metrics, so `text-base`
			// (which carries a line-height) is replaced by a size-only `text-[1rem]`.
			className={cn(
				"w-full rounded-md border border-input bg-transparent px-3 py-2 text-[1rem] text-foreground shadow-sm",
				editable === false && "opacity-50",
				className,
			)}
			placeholderTextColor={c.textTertiary}
			editable={editable}
			{...props}
		/>
	)
}

export { Input }
