import { DEV_API_URL, PROD_API_URL } from "@batchmate/api-client"
import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import * as SecureStore from "expo-secure-store"

export const authClient = createAuthClient({
	baseURL: __DEV__ ? DEV_API_URL : PROD_API_URL,
	basePath: "/api/v1/auth",
	plugins: [
		expoClient({
			scheme: "batchmate",
			storagePrefix: "batchmate",
			storage: SecureStore,
		}),
	],
})

export const { useSession, signIn, signUp, signOut } = authClient
