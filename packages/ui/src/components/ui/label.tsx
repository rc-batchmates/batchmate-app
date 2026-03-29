import * as LabelPrimitive from "@rn-primitives/label"
import * as React from "react"

import { cn } from "../../lib/cn"

function Label({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Text>) {
	return (
		<LabelPrimitive.Text
			className={cn(
				"text-sm font-medium leading-none text-foreground",
				className,
			)}
			{...props}
		/>
	)
}

export { Label }
