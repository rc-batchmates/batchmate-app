import { Monitor, Video } from "lucide-react-native"
import { Linking, Platform, Pressable, View } from "react-native"
import { Text } from "./text"

const pairingStations = [1, 2, 3, 4, 5] as const

function RoomChip({
	label,
	slug,
	icon: Icon = Video,
	fullWidth,
}: {
	label: string
	slug: string
	icon?: typeof Video
	fullWidth?: boolean
}) {
	const href = `https://www.recurse.com/zoom/${slug}`

	const content = (
		<>
			<View className="h-8 w-8 items-center justify-center rounded-lg bg-surface-inset md:h-7 md:w-7">
				<Icon size={14} color="#22D3EE" />
			</View>
			<Text className="text-[13px] font-medium text-foreground md:text-sm">
				{label}
			</Text>
		</>
	)

	const className = fullWidth
		? "flex-1 flex-row items-center gap-2.5 rounded-[10px] bg-card px-3 py-2.5 md:gap-2.5 md:px-4 md:py-3"
		: "flex-1 flex-row items-center gap-2.5 rounded-[10px] bg-card px-3 py-2.5 md:gap-2.5 md:px-4 md:py-3"

	if (Platform.OS === "web") {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={className}
				style={{ textDecoration: "none", minWidth: 0 }}
			>
				{content}
			</a>
		)
	}

	return (
		<Pressable className={className} onPress={() => Linking.openURL(href)}>
			{content}
		</Pressable>
	)
}

function PairingButton({ n }: { n: number }) {
	const href = `https://www.recurse.com/zoom/pairing_station_${n}`

	const content = (
		<Text className="font-mono text-sm font-semibold text-foreground">{n}</Text>
	)

	if (Platform.OS === "web") {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className="flex flex-1 items-center justify-center rounded-[10px] bg-card py-2"
				style={{ textDecoration: "none", minWidth: 0, height: 38 }}
			>
				{content}
			</a>
		)
	}

	return (
		<Pressable
			className="flex-1 items-center justify-center rounded-[10px] bg-card py-2"
			style={{ height: 38 }}
			onPress={() => Linking.openURL(href)}
		>
			{content}
		</Pressable>
	)
}

function ZoomLinks() {
	return (
		<View className="w-full gap-4">
			{/* Header */}
			<View className="flex-row items-center gap-1.5">
				<Video size={14} color="#22D3EE" />
				<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
					ZOOM ROOMS
				</Text>
			</View>

			{/* Room Grid */}
			<View className="gap-2 md:gap-2.5">
				{/* Presentation Space — full width */}
				<View className="flex-row gap-2 md:gap-2.5">
					<RoomChip
						label="Presentation Space"
						slug="presentation_space"
						icon={Monitor}
						fullWidth
					/>
				</View>

				{/* Desktop: 3 columns */}
				<View className="hidden md:flex md:flex-row md:gap-2.5">
					<RoomChip label="Midori" slug="midori" />
					<RoomChip label="Aegis" slug="aegis" />
					<RoomChip label="Edos" slug="edos" />
				</View>
				<View className="hidden md:flex md:flex-row md:gap-2.5">
					<RoomChip label="Couches" slug="couches" />
					<RoomChip label="Genera" slug="genera" />
					<RoomChip label="Verve" slug="verve" />
				</View>

				{/* Mobile: 2 columns */}
				<View className="flex-row gap-2 md:hidden">
					<RoomChip label="Midori" slug="midori" />
					<RoomChip label="Aegis" slug="aegis" />
				</View>
				<View className="flex-row gap-2 md:hidden">
					<RoomChip label="Edos" slug="edos" />
					<RoomChip label="Couches" slug="couches" />
				</View>
				<View className="flex-row gap-2 md:hidden">
					<RoomChip label="Genera" slug="genera" />
					<RoomChip label="Verve" slug="verve" />
				</View>
			</View>

			{/* Pairing Stations */}
			<View className="gap-2">
				<Text className="font-mono text-[11px] text-text-muted">
					Pairing Stations
				</Text>
				<View className="flex-row gap-2 md:gap-2.5">
					{pairingStations.map((n) => (
						<PairingButton key={n} n={n} />
					))}
				</View>
			</View>
		</View>
	)
}

export { ZoomLinks }
