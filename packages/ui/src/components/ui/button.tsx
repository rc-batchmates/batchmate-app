import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"
import { Pressable } from "react-native"

import { cn } from "../../lib/cn"
import { TextClassContext } from "./text"

const buttonVariants = cva(
	"flex flex-row items-center justify-center gap-2 rounded-md text-sm font-medium disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary active:bg-primary/90",
				destructive: "bg-destructive active:bg-destructive/90",
				outline: "border border-input bg-background shadow-xs active:bg-accent",
				secondary: "bg-secondary active:bg-secondary/80",
				ghost: "active:bg-accent",
				link: "",
			},
			size: {
				default: "h-9 px-4 py-2",
				xs: "h-6 gap-1 rounded-md px-2",
				sm: "h-8 rounded-md gap-1.5 px-3",
				lg: "h-10 rounded-md px-6",
				icon: "h-9 w-9",
				"icon-xs": "h-6 w-6 rounded-md",
				"icon-sm": "h-8 w-8",
				"icon-lg": "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
)

const buttonTextVariants = cva("text-sm font-medium", {
	variants: {
		variant: {
			default: "text-primary-foreground",
			destructive: "text-white",
			outline: "text-accent-foreground",
			secondary: "text-secondary-foreground",
			ghost: "text-accent-foreground",
			link: "text-primary underline",
		},
	},
	defaultVariants: {
		variant: "default",
	},
})

function Button({
	className,
	variant = "default",
	size = "default",
	disabled,
	...props
}: React.ComponentPropsWithoutRef<typeof Pressable> &
	VariantProps<typeof buttonVariants>) {
	return (
		<TextClassContext.Provider value={buttonTextVariants({ variant })}>
			<Pressable
				className={cn(
					buttonVariants({ variant, size }),
					disabled && "opacity-50",
					className,
				)}
				disabled={disabled}
				{...props}
			/>
		</TextClassContext.Provider>
	)
}

export { Button, buttonVariants }
