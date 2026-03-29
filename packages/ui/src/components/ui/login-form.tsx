import { useState } from "react"
import { View } from "react-native"
import { Button } from "./button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./card"
import { Text } from "./text"

export type LoginFormProps = {
	onSubmit: () => Promise<void>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)

	async function handleSubmit() {
		setError("")
		setLoading(true)
		try {
			await onSubmit()
		} catch (e) {
			setError(e instanceof Error ? e.message : "Sign in failed")
		} finally {
			setLoading(false)
		}
	}

	return (
		<View className="gap-8">
			<View className="items-center gap-2">
				<Text className="text-3xl font-bold">batchmate.app</Text>
				<Text className="text-sm text-muted-foreground">Welcome back</Text>
			</View>

			<Card className="w-full">
				<CardHeader>
					<CardTitle>
						<Text>Sign in</Text>
					</CardTitle>
					<CardDescription>
						<Text>Sign in with your Recurse Center account</Text>
					</CardDescription>
				</CardHeader>
				<CardContent className="gap-4">
					{error ? (
						<Text className="text-sm text-destructive">{error}</Text>
					) : null}

					<Button
						className="bg-brand h-[52px] rounded-xl"
						onPress={handleSubmit}
						disabled={loading}
					>
						<Text className="text-brand-foreground font-semibold">
							{loading ? "Redirecting..." : "Sign in with Recurse Center"}
						</Text>
					</Button>
				</CardContent>
			</Card>
		</View>
	)
}
