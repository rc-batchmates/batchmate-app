import { DEV_API_URL, PROD_API_URL } from "@batchmate/api-client"
import Constants from "expo-constants"

const useProd = process.env.EXPO_PUBLIC_USE_PROD_API === "true"

function devApiUrl(): string {
	const hostUri = Constants.expoConfig?.hostUri
	if (!hostUri) return DEV_API_URL
	const host = hostUri.split(":")[0]
	const port = new URL(DEV_API_URL).port || "8787"
	return `http://${host}:${port}`
}

export const apiUrl = !__DEV__ || useProd ? PROD_API_URL : devApiUrl()
