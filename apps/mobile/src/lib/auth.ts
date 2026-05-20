import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import * as SecureStore from "expo-secure-store"
import { apiUrl } from "./api-url"

export const authClient = createAuthClient({
	baseURL: apiUrl,
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
