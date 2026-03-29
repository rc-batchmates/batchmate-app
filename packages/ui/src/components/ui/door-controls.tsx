import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Text } from "./text"

type Floor = "4" | "5"
type Entry = "elevator" | "stairs"

export interface DoorControlsProps {
	onOpenDoor: (floor: Floor, entry: Entry) => void
	isPending?: boolean
	pendingDoor?: { floor: Floor; entry: Entry } | null
}

const doors: { floor: Floor; entry: Entry; label: string }[] = [
	{ floor: "4", entry: "stairs", label: "4th Floor — Stairs" },
	{ floor: "4", entry: "elevator", label: "4th Floor — Elevator" },
	{ floor: "5", entry: "stairs", label: "5th Floor — Stairs" },
	{ floor: "5", entry: "elevator", label: "5th Floor — Elevator" },
]

function DoorControls({
	onOpenDoor,
	isPending,
	pendingDoor,
}: DoorControlsProps) {
	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>
					<Text>Open Door</Text>
				</CardTitle>
			</CardHeader>
			<CardContent className="gap-3">
				{doors.map((door) => {
					const isThis =
						pendingDoor?.floor === door.floor &&
						pendingDoor?.entry === door.entry
					return (
						<Button
							key={`${door.floor}-${door.entry}`}
							variant="outline"
							size="lg"
							className="w-full"
							onPress={() => onOpenDoor(door.floor, door.entry)}
							disabled={isPending}
						>
							<Text>{isThis && isPending ? "Opening..." : door.label}</Text>
						</Button>
					)
				})}
			</CardContent>
		</Card>
	)
}

export { DoorControls }
