import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
	baseURL: "",
	basePath: "/api/v1/auth",
})

export const { useSession, signIn, signOut } = authClient
