// Routes Snack Bar NFC tags (https://batchmate.app/snack/<skuId>) straight
// into the app. app.json `intentFilters` can't express this: Expo prefixes
// every action with `android.intent.action.`, and NFC dispatch uses
// `android.nfc.action.NDEF_DISCOVERED`. React Native's Linking treats
// NDEF_DISCOVERED like VIEW, so expo-router receives the tag URL as a deep link.
const { AndroidConfig, withAndroidManifest } = require("expo/config-plugins")

const NDEF_DISCOVERED = "android.nfc.action.NDEF_DISCOVERED"

module.exports = function withSnackBarNfc(config) {
	return withAndroidManifest(config, (config) => {
		const manifest = config.modResults.manifest

		// The NFC permission implies android.hardware.nfc is required, which
		// would hide the app from phones without NFC on the Play Store.
		manifest["uses-feature"] = (manifest["uses-feature"] ?? []).filter(
			(f) => f.$["android:name"] !== "android.hardware.nfc",
		)
		manifest["uses-feature"].push({
			$: {
				"android:name": "android.hardware.nfc",
				"android:required": "false",
			},
		})

		const activity = AndroidConfig.Manifest.getMainActivityOrThrow(
			config.modResults,
		)
		const filters = (activity["intent-filter"] ?? []).filter(
			(f) => f.action?.[0]?.$["android:name"] !== NDEF_DISCOVERED,
		)
		filters.push({
			action: [{ $: { "android:name": NDEF_DISCOVERED } }],
			category: [{ $: { "android:name": "android.intent.category.DEFAULT" } }],
			data: [
				{
					$: {
						"android:scheme": "https",
						"android:host": "batchmate.app",
						"android:pathPrefix": "/snack/",
					},
				},
			],
		})
		activity["intent-filter"] = filters
		return config
	})
}
