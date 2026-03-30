import type * as React from "react"
import { View } from "react-native"

import { cn } from "../../lib/cn"
import { TextClassContext } from "./text"

function Card({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof View>) {
	return (
		<View
			className={cn(
				"rounded-xl bg-card gap-6 py-6",
				className,
			)}
			{...props}
		/>
	)
}

function CardHeader({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof View>) {
	return (
		<View className={cn("flex flex-col gap-2 px-6", className)} {...props} />
	)
}

function CardTitle({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof View>) {
	return (
		<TextClassContext.Provider value="text-base font-semibold leading-none text-card-foreground">
			<View className={cn("flex flex-row", className)} {...props} />
		</TextClassContext.Provider>
	)
}

function CardDescription({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof View>) {
	return (
		<TextClassContext.Provider value="text-sm text-muted-foreground">
			<View className={cn("flex flex-row", className)} {...props} />
		</TextClassContext.Provider>
	)
}

function CardAction({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof View>) {
	return (
		<View className={cn("items-end justify-start", className)} {...props} />
	)
}

function CardContent({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof View>) {
	return <View className={cn("px-6", className)} {...props} />
}

function CardFooter({
	className,
	...props
}: React.ComponentPropsWithoutRef<typeof View>) {
	return (
		<View
			className={cn("flex flex-row items-center px-6", className)}
			{...props}
		/>
	)
}

export {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
}
