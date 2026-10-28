import * as Slot from "@rn-primitives/slot"
import * as React from "react"
import { Text as RNText, useWindowDimensions } from "react-native"

import { cn } from "../../lib/cn"

const TextClassContext = React.createContext<string | undefined>(undefined)

function Text({
	className,
	asChild = false,
	...props
}: React.ComponentPropsWithoutRef<typeof RNText> & { asChild?: boolean }) {
	const textClass = React.useContext(TextClassContext)
	const { fontScale } = useWindowDimensions()
	const Comp = asChild ? Slot.Text : RNText

	// React Native 0.81 on iOS doesn't re-measure existing text when the system
	// text size changes, so remount just the text node on a new fontScale.
	return (
		<Comp
			key={fontScale}
			className={cn("text-base text-foreground", textClass, className)}
			{...props}
		/>
	)
}

export { Text, TextClassContext }
