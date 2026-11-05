import { Platform } from "react-native"
import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager"
import { skuIdFromTagUrl, snackTagUrl } from "./snack-bar"

let started: Promise<void> | null = null

export type NfcStatus = "ready" | "disabled" | "unsupported"

export async function getNfcStatus(): Promise<NfcStatus> {
	if (!(await NfcManager.isSupported())) return "unsupported"
	started ??= NfcManager.start()
	await started
	// iOS has no NFC on/off switch; isEnabled is Android-only.
	if (Platform.OS === "android" && !(await NfcManager.isEnabled())) {
		return "disabled"
	}
	return "ready"
}

export function openNfcSettings() {
	return NfcManager.goToNfcSetting()
}

// While a technology request is open, Android reads tags in reader mode, so
// tapping a Snack Bar tag here doesn't also trigger a purchase.
async function withNdef<T>(alertMessage: string, fn: () => Promise<T>) {
	await NfcManager.requestTechnology(NfcTech.Ndef, { alertMessage })
	try {
		return await fn()
	} finally {
		await NfcManager.cancelTechnologyRequest().catch(() => {})
	}
}

export function writeSnackTag(skuId: string) {
	return withNdef("Hold your phone near the Snack Bar tag", async () => {
		const bytes = Ndef.encodeMessage([Ndef.uriRecord(snackTagUrl(skuId))])
		await NfcManager.ndefHandler.writeNdefMessage(bytes)
	})
}

export type ScannedTag = { url: string | null; skuId: string | null }

export function readSnackTag(): Promise<ScannedTag> {
	return withNdef("Hold your phone near a tag", async () => {
		const tag = await NfcManager.getTag()
		const record = tag?.ndefMessage?.[0]
		const url =
			record && Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)
				? Ndef.uri.decodePayload(new Uint8Array(record.payload))
				: null
		return { url, skuId: url ? skuIdFromTagUrl(url) : null }
	})
}

export function cancelNfc() {
	return NfcManager.cancelTechnologyRequest().catch(() => {})
}
