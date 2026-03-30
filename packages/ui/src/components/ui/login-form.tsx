import { Calendar, DoorOpen, LogIn, Users } from "lucide-react-native"
import { useState } from "react"
import { Image, type ImageSourcePropType, Pressable, View } from "react-native"
import { Text } from "./text"

export type LoginFormProps = {
	onSubmit: () => Promise<void>
	logoSource?: ImageSourcePropType | string
}

function FeatureRow({
	icon: Icon,
	label,
}: {
	icon: typeof DoorOpen
	label: string
}) {
	return (
		<View className="flex-row items-center gap-2.5">
			<Icon size={16} color="#22D3EE" />
			<Text className="text-[13px] text-text-secondary">{label}</Text>
		</View>
	)
}

export function LoginForm({ onSubmit, logoSource }: LoginFormProps) {
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
		<View className="flex-1 items-center justify-center gap-8 px-6">
			{/* Logo */}
			<View className="items-center gap-4">
				<View className="h-20 w-20 items-center justify-center overflow-hidden rounded-[20px] bg-card">
					{logoSource ? (
						<Image
							source={
								typeof logoSource === "string"
									? { uri: logoSource }
									: logoSource
							}
							className="h-14 w-14"
							resizeMode="contain"
						/>
					) : null}
				</View>
				<Text className="font-mono text-[32px] font-bold">batchmate</Text>
				<Text className="font-mono text-sm text-text-tertiary">
					The next generation of recurse tooling
				</Text>
			</View>

			{/* Sign In Button */}
			<View className="w-full gap-4">
				{error ? (
					<Text className="text-center text-sm text-destructive">{error}</Text>
				) : null}
				<Pressable
					className="h-14 w-full flex-row items-center justify-center gap-2.5 rounded-xl bg-primary"
					onPress={loading ? undefined : handleSubmit}
					disabled={loading}
				>
					<LogIn size={20} color="#0A0F1C" />
					<Text className="text-base font-semibold text-primary-foreground">
						{loading ? "Redirecting..." : "Sign in with Recurse Center"}
					</Text>
				</Pressable>
			</View>

			{/* Features */}
			<View className="items-center gap-4">
				<FeatureRow icon={DoorOpen} label="Building door access" />
				<FeatureRow icon={Calendar} label="Hub & schedule management" />
				<FeatureRow icon={Users} label="Recurse Center community" />
			</View>

			{/* Footer */}
			<View className="items-center gap-1">
				<Text className="font-mono text-[11px] text-text-muted">
					Built by your fellow
				</Text>
				<Text className="font-mono text-[11px] font-medium text-primary">
					Batchmates
				</Text>
			</View>
		</View>
	)
}
