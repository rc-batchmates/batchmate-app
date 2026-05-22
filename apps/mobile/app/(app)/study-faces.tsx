import {
	STUDY_FACES_STORAGE_KEYS,
	StudyFacesGame,
	type StudyFacesStorage,
	Text,
} from "@batchmate/ui"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Pressable, ScrollView, View } from "react-native"
import { api } from "../../src/lib/api"
import { useSession } from "../../src/lib/auth"
import { hydrate, readSync, remove, write } from "../../src/lib/json-storage"

const mobileStorage: StudyFacesStorage = {
	read: readSync,
	write,
	remove,
}

const STORAGE_KEYS = [
	STUDY_FACES_STORAGE_KEYS.cards,
	STUDY_FACES_STORAGE_KEYS.confusion,
	STUDY_FACES_STORAGE_KEYS.streak,
	STUDY_FACES_STORAGE_KEYS.active,
]

export default function StudyFacesScreen() {
	const router = useRouter()
	const { data: session } = useSession()
	const sessionUser = session?.user as { rcId?: string } | undefined
	const userRcId = sessionUser?.rcId
		? Number.parseInt(sessionUser.rcId, 10)
		: undefined

	const [storageReady, setStorageReady] = useState(false)

	useEffect(() => {
		let cancelled = false
		hydrate(STORAGE_KEYS).then(() => {
			if (!cancelled) setStorageReady(true)
		})
		return () => {
			cancelled = true
		}
	}, [])

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-4"
		>
			<View className="flex-row items-center justify-between">
				<Pressable
					className="flex-row items-center gap-1.5"
					onPress={() => router.back()}
				>
					<ChevronLeft size={20} color="#94A3B8" />
					<Text className="text-sm font-medium text-text-secondary">Back</Text>
				</Pressable>
				<Text className="text-[15px] font-semibold">Study faces</Text>
				<View className="w-12" />
			</View>

			{storageReady && (
				<StudyFacesGame api={api} userRcId={userRcId} storage={mobileStorage} />
			)}
		</ScrollView>
	)
}
