import * as React from "react"
import { TextInput } from "react-native"

import { cn } from "../../lib/cn"

function Input({
	className,
	placeholderClassName,
	editable,
	...props
}: React.ComponentPropsWithoutRef<typeof TextInput> & {
	placeholderClassName?: string
}) {
	return (
		<TextInput
			className={cn(
				"h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base text-foreground shadow-sm",
				editable === false && "opacity-50",
				className,
			)}
			placeholderTextColor="#78716c"
			editable={editable}
			{...props}
		/>
	)
}

export { Input }
