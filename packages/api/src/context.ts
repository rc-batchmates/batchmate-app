import type { Database } from "@batchmate/db"
import { account } from "@batchmate/db/auth-schema"
import { createRecurseApi, type RecurseApiClient } from "@batchmate/recurse-api"
import {
	createSecurityApi,
	type SecurityApiClient,
} from "@batchmate/security-api"
import { implement } from "@orpc/server"
import { and, eq } from "drizzle-orm"
import { contract } from "./contract"

export interface BaseContext {
	db: Database
	securityComputer: Fetcher
	rcOAuth: { clientId: string; clientSecret: string } | null
	user: { id: string; name: string; email: string } | null
	session: { id: string } | null
}

export interface Context
	extends Omit<BaseContext, "securityComputer" | "rcOAuth"> {
	securityApi: SecurityApiClient
	recurseApi: RecurseApiClient | null
}

async function getRcAccessToken(
	db: Database,
	userId: string,
	clientId: string,
	clientSecret: string,
): Promise<string | null> {
	const rcAccount = await db
		.select({
			id: account.id,
			accessToken: account.accessToken,
			refreshToken: account.refreshToken,
			accessTokenExpiresAt: account.accessTokenExpiresAt,
		})
		.from(account)
		.where(and(eq(account.userId, userId), eq(account.providerId, "recurse")))
		.get()

	if (!rcAccount?.accessToken) return null

	// If the token hasn't expired yet (with 5 min buffer), use it as-is
	const expiresAt = rcAccount.accessTokenExpiresAt?.getTime() ?? 0
	if (expiresAt > Date.now() + 5 * 60 * 1000) {
		return rcAccount.accessToken
	}

	// Token is expired or about to expire — refresh it
	if (!rcAccount.refreshToken) return null

	const res = await fetch("https://www.recurse.com/oauth/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: rcAccount.refreshToken,
			client_id: clientId,
			client_secret: clientSecret,
		}),
	})

	if (!res.ok) return null

	const tokens = (await res.json()) as {
		access_token: string
		refresh_token: string
		expires_in: number
	}

	// Persist the new tokens
	await db
		.update(account)
		.set({
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
		})
		.where(eq(account.id, rcAccount.id))

	return tokens.access_token
}

const base = implement(contract).$context<BaseContext>()

export const server = base.use(async ({ context, next }) => {
	let recurseApi: RecurseApiClient | null = null

	if (context.user && context.rcOAuth) {
		const token = await getRcAccessToken(
			context.db,
			context.user.id,
			context.rcOAuth.clientId,
			context.rcOAuth.clientSecret,
		)
		if (token) {
			recurseApi = createRecurseApi(token)
		}
	}

	return next({
		context: {
			securityApi: createSecurityApi(context.securityComputer),
			recurseApi,
		},
	})
})
