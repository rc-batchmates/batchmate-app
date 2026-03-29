import * as Slot from "@rn-primitives/slot"
import * as React from "react"
import { Text as RNText } from "react-native"

import { cn } from "../../lib/cn"

const TextClassContext = React.createContext<string | undefined>(undefined)

function Text({
	className,
	asChild = false,
	...props
}: React.ComponentPropsWithoutRef<typeof RNText> & { asChild?: boolean }) {
	const textClass = React.useContext(TextClassContext)
	const Comp = asChild ? Slot.Text : RNText

	return (
		<Comp
			className={cn("text-base text-foreground", textClass, className)}
			{...props}
		/>
	)
}

export { Text, TextClassContext }
