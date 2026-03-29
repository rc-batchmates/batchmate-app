import type { Database } from "@batchmate/db"
import { expo } from "@better-auth/expo"
import { type BetterAuthOptions, betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { genericOAuth } from "better-auth/plugins"

const RC_BASE = "https://www.recurse.com"

export const authOptions = {
	basePath: "/api/v1/auth",
} satisfies Partial<BetterAuthOptions>

export type AuthEnv = {
	BETTER_AUTH_SECRET: string
	RC_CLIENT_ID: string
	RC_CLIENT_SECRET: string
	BASE_URL?: string
}

export function createAuth(db: Database, env: AuthEnv) {
	return betterAuth({
		...authOptions,
		baseURL: env.BASE_URL ?? "https://recurse.rocks",
		plugins: [
			expo(),
			genericOAuth({
				config: [
					{
						providerId: "recurse",
						authorizationUrl: `${RC_BASE}/oauth/authorize`,
						tokenUrl: `${RC_BASE}/oauth/token`,
						userInfoUrl: `${RC_BASE}/api/v1/profiles/me`,
						clientId: env.RC_CLIENT_ID,
						clientSecret: env.RC_CLIENT_SECRET,
						scopes: [],
						mapProfileToUser(profile) {
							return {
								name: profile.name,
								email: profile.email,
								image: profile.image_path,
								rcId: String(profile.id),
								github: profile.github ?? null,
								twitter: profile.twitter ?? null,
								linkedin: profile.linkedin ?? null,
								personalSiteUrl: profile.personal_site_url ?? null,
							}
						},
					},
				],
			}),
		],
		trustedOrigins: [
			"http://recurse.rocks",
			"https://recurse.rocks",
			"http://localhost:5173",
			"http://localhost:8787",
			"batchmate://",
			"exp://",
		],
		database: drizzleAdapter(db, {
			provider: "sqlite",
		}),
		secret: env.BETTER_AUTH_SECRET,
		user: {
			additionalFields: {
				rcId: { type: "string", required: false },
				github: { type: "string", required: false },
				twitter: { type: "string", required: false },
				linkedin: { type: "string", required: false },
				personalSiteUrl: { type: "string", required: false },
			},
		},
	})
}

export type Auth = ReturnType<typeof createAuth>
