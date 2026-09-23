import {
	formatHubDate,
	hubDateToLocalDate,
	localDateToHubDate,
	shiftHubDate,
	Text,
} from "@batchmate/ui"
import DateTimePicker, {
	DateTimePickerAndroid,
} from "@react-native-community/datetimepicker"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { useState } from "react"
import { Modal, Platform, Pressable, View } from "react-native"

export function HubDateHeader({
	date,
	today,
	onChange,
}: {
	date: string
	today: string
	onChange: (date: string) => void
}) {
	const [iosPickerOpen, setIosPickerOpen] = useState(false)
	const isToday = date === today
	const maximumDate = hubDateToLocalDate(today)

	const select = (picked: Date | undefined) => {
		if (!picked) return
		const next = localDateToHubDate(picked)
		onChange(next < today ? next : today)
	}

	const openPicker = () => {
		if (Platform.OS === "android") {
			DateTimePickerAndroid.open({
				mode: "date",
				value: hubDateToLocalDate(date),
				maximumDate,
				onChange: (event, picked) => {
					if (event.type === "set") select(picked)
				},
			})
		} else {
			setIosPickerOpen(true)
		}
	}

	return (
		<View className="-ml-2 flex-row items-center gap-1">
			<Pressable
				accessibilityLabel="Previous day"
				onPress={() => onChange(shiftHubDate(date, -1))}
				className="h-8 w-8 items-center justify-center rounded-full"
				hitSlop={6}
			>
				<ChevronLeft size={22} color="#64748B" />
			</Pressable>
			<Pressable onPress={openPicker} hitSlop={6}>
				<Text className="text-2xl font-semibold" numberOfLines={1}>
					{formatHubDate(date)}
				</Text>
			</Pressable>
			<Pressable
				accessibilityLabel="Next day"
				onPress={() => onChange(shiftHubDate(date, 1))}
				disabled={isToday}
				className={`h-8 w-8 items-center justify-center rounded-full ${
					isToday ? "opacity-30" : ""
				}`}
				hitSlop={6}
			>
				<ChevronRight size={22} color="#64748B" />
			</Pressable>

			{Platform.OS === "ios" && (
				<Modal
					visible={iosPickerOpen}
					transparent
					animationType="fade"
					onRequestClose={() => setIosPickerOpen(false)}
				>
					<Pressable
						onPress={() => setIosPickerOpen(false)}
						className="flex-1 items-center justify-center bg-black/70 px-6"
					>
						<Pressable className="w-full max-w-sm rounded-2xl bg-card p-2">
							<DateTimePicker
								mode="date"
								display="inline"
								themeVariant="dark"
								accentColor="#22D3EE"
								value={hubDateToLocalDate(date)}
								maximumDate={maximumDate}
								onChange={(event, picked) => {
									if (event.type !== "set") return
									select(picked)
									setIosPickerOpen(false)
								}}
							/>
						</Pressable>
					</Pressable>
				</Modal>
			)}
		</View>
	)
}
