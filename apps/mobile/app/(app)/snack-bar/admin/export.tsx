import { SnackBarExport } from "@batchmate/ui"
import { File, Paths } from "expo-file-system"
import * as Sharing from "expo-sharing"
import { ScrollView } from "react-native"
import { BackHeader } from "../../../../src/components/back-header"
import { SnackBarAdminGate } from "../../../../src/components/snack-bar-admin-gate"
import { api } from "../../../../src/lib/api"

async function shareCsv({ filename, csv }: { filename: string; csv: string }) {
	const file = new File(Paths.cache, filename)
	if (file.exists) file.delete()
	file.create()
	file.write(csv)
	await Sharing.shareAsync(file.uri, {
		mimeType: "text/csv",
		UTI: "public.comma-separated-values-text",
		dialogTitle: "Snack Bar export",
	})
}

export default function SnackBarExportScreen() {
	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-6"
			keyboardShouldPersistTaps="handled"
		>
			<BackHeader title="Export" />
			<SnackBarAdminGate>
				<SnackBarExport api={api} onExport={shareCsv} />
			</SnackBarAdminGate>
		</ScrollView>
	)
}
