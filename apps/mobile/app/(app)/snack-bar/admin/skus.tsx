import type { SnackSku } from "@batchmate/api-client"
import {
	formatCents,
	SecondaryButton,
	SkuIconButton,
	SnackBarSkuManager,
	Text,
	useThemeColors,
} from "@batchmate/ui"
import { Nfc, ScanSearch } from "lucide-react-native"
import { useEffect, useRef, useState } from "react"
import { ScrollView, View } from "react-native"
import { BackHeader } from "../../../../src/components/back-header"
import {
	type NfcPrompt,
	NfcScanModal,
} from "../../../../src/components/nfc-scan-modal"
import { SnackBarAdminGate } from "../../../../src/components/snack-bar-admin-gate"
import { api } from "../../../../src/lib/api"
import {
	cancelNfc,
	getNfcStatus,
	type NfcStatus,
	openNfcSettings,
	readSnackTag,
	writeSnackTag,
} from "../../../../src/lib/nfc"

function nfcErrorMessage(error: unknown) {
	const message = error instanceof Error ? error.message : String(error ?? "")
	return message || "Couldn't talk to the tag. Hold it still and try again."
}

export default function SnackBarSkusScreen() {
	const c = useThemeColors()
	const [nfcStatus, setNfcStatus] = useState<NfcStatus | null>(null)
	// One NFC operation at a time; its whole lifecycle lives in the modal.
	const [prompt, setPrompt] = useState<NfcPrompt | null>(null)
	// Bumped on every start and cancel, so a cancelled operation's late
	// rejection (cancelTechnologyRequest fails the pending read/write, often
	// with an empty message) can't reopen the modal.
	const runId = useRef(0)

	useEffect(() => {
		getNfcStatus()
			.then(setNfcStatus)
			.catch(() => setNfcStatus("unsupported"))
		return () => {
			cancelNfc()
		}
	}, [])

	const busy = prompt !== null

	// `op` resolves to the success message or throws with the failure.
	async function runNfc(
		label: { reason: string; detail?: string },
		op: () => Promise<string>,
	) {
		const id = ++runId.current
		setPrompt({ ...label, status: "waiting" })
		try {
			const message = await op()
			if (id === runId.current) {
				setPrompt({ ...label, status: "success", message })
			}
		} catch (error) {
			if (id === runId.current) {
				setPrompt({
					...label,
					status: "error",
					message: nfcErrorMessage(error),
				})
			}
		}
	}

	function cancel() {
		runId.current++
		setPrompt(null)
		cancelNfc()
	}

	function writeTag(sku: SnackSku) {
		runNfc({ reason: "Write tag", detail: sku.name }, async () => {
			await writeSnackTag(sku.id)
			return `Wrote the tag for ${sku.name}`
		})
	}

	function identifyTag() {
		runNfc({ reason: "Identify SKU" }, async () => {
			const tag = await readSnackTag()
			if (!tag.url) throw new Error("This tag is blank.")
			if (!tag.skuId) {
				throw new Error(`Not a Snack Bar tag. It points to ${tag.url}`)
			}
			let sku: SnackSku
			try {
				sku = await api.snackBarSku.call({ id: tag.skuId })
			} catch {
				throw new Error(
					`This tag points to a snack that doesn't exist here (${tag.skuId}). It may have been written from another environment.`,
				)
			}
			return `Identified tag: ${sku.name} · ${formatCents(sku.priceCents)}${
				sku.archived ? " (archived)" : ""
			}`
		})
	}

	const nfcReady = nfcStatus === "ready"

	const nfcPanel = (
		<View className="gap-3 rounded-xl border border-cyan/20 bg-cyan/5 p-4">
			<View className="flex-row items-center gap-2">
				<Nfc size={18} color={c.primary} />
				<Text className="flex-1 text-[15px] font-semibold text-primary">
					NFC tags
				</Text>
			</View>

			{nfcStatus === "unsupported" && (
				<Text className="text-xs text-text-tertiary">
					This device can't read or write NFC tags.
				</Text>
			)}
			{nfcStatus === "disabled" && (
				<SecondaryButton label="Turn on NFC" onPress={openNfcSettings} />
			)}
			{nfcReady && (
				<>
					<Text className="text-xs text-text-tertiary">
						Write a tag from a snack below, or identify an existing tag. NTAG213
						stickers work well.
					</Text>
					<SecondaryButton
						label="Identify a tag"
						icon={<ScanSearch size={14} color={c.primary} />}
						disabled={busy}
						onPress={identifyTag}
					/>
				</>
			)}
		</View>
	)

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-6"
			keyboardShouldPersistTaps="handled"
		>
			<BackHeader title="Snacks & tags" />
			<NfcScanModal
				prompt={prompt}
				onCancel={cancel}
				onDone={() => setPrompt(null)}
			/>
			<SnackBarAdminGate>
				<SnackBarSkuManager
					api={api}
					header={nfcPanel}
					renderSkuActions={
						nfcReady
							? (sku) => (
									<SkuIconButton
										accessibilityLabel={`Write tag for ${sku.name}`}
										disabled={busy}
										onPress={() => writeTag(sku)}
									>
										<Nfc size={16} color={c.primary} />
									</SkuIconButton>
								)
							: undefined
					}
				/>
			</SnackBarAdminGate>
		</ScrollView>
	)
}
