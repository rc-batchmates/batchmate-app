import {
	newSnackLinkKey,
	SnackPurchaseSummary,
	Text,
	useThemeColors,
} from "@batchmate/ui"
import { Redirect, useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { ActivityIndicator, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BackHeader } from "../../src/components/back-header"
import { api } from "../../src/lib/api"
import { useSession } from "../../src/lib/auth"

const KEY_PATTERN = /^[A-Za-z0-9_-]{8,64}$/

// Opened by Snack Bar NFC tags (https://batchmate.app/snack/<skuId>). See
// SNACK_LINK_KEY_PARAM in @batchmate/ui for how `?k=` keeps a reopened link
// from buying twice.
export default function SnackScreen() {
	const c = useThemeColors()
	const params = useLocalSearchParams<{ skuId: string; k?: string }>()
	const skuId = params.skuId
	const k = params.k && KEY_PATTERN.test(params.k) ? params.k : null
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const { data: session, isPending } = useSession()
	const [freshKey] = useState(newSnackLinkKey)
	const goHome = useCallback(() => router.replace("/(app)"), [router])

	// Key first, before the login check, so a tap that has to log in first
	// still comes back to the same key. <Redirect> (not router.replace in an
	// effect) because a tag can cold-start the app straight onto this screen,
	// before the root navigator has mounted.
	if (!k) {
		return (
			<Redirect
				href={{ pathname: "/snack/[skuId]", params: { skuId, k: freshKey } }}
			/>
		)
	}

	if (!isPending && !session) {
		return (
			<Redirect
				href={{
					pathname: "/(auth)/login",
					params: { redirect: `/snack/${skuId}?k=${k}` },
				}}
			/>
		)
	}

	return (
		// Outside the (app) group, so this screen applies its own safe-area inset.
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerClassName="px-6 py-4 gap-6"
			>
				<BackHeader title="Snack Bar" />
				{session ? (
					<SnackPurchaseSummary
						key={k}
						api={api}
						skuId={skuId}
						idempotencyKey={k}
						source="nfc"
						onViewTab={() => router.replace("/snack-bar")}
						onExpire={goHome}
					/>
				) : (
					<View className="items-center gap-4 py-16">
						<ActivityIndicator color={c.primary} size="large" />
						<Text className="text-sm text-text-tertiary">Loading...</Text>
					</View>
				)}
			</ScrollView>
		</View>
	)
}
