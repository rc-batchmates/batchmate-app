import type { Database } from "@batchmate/db"
import { createSecurityApi } from "@batchmate/security-api"
import { expo } from "@better-auth/expo"
import { type BetterAuthOptions, betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { genericOAuth, sec } from "better-auth/plugins"

const RC_BASE = "https://www.recurse.com"

export const authOptions = {
	basePath: "/api/v1/auth",
} satisfies Partial<BetterAuthOptions>

export type AuthEnv = {
	BETTER_AUTH_SECRET: string
	RC_CLIENT_ID: string
	RC_CLIENT_SECRET: string
	BASE_URL?: string
	SECURITY_COMPUTER: Fetcher
	VIRTUAL_CARD_PREFIX?: string
	VIRTUAL_CARD_SITE_CODE?: string
}

export function createAuth(db: Database, env: AuthEnv) {
	const securityApi = createSecurityApi(env.SECURITY_COMPUTER)

	return betterAuth({
		...authOptions,
		baseURL: env.BASE_URL ?? "https://recurse.rocks",
		plugins: [
			expo(),
			genericOAuth({
				config: [
					{
						providerId: "recurse",
						overrideUserInfo: true,
						authorizationUrl: `${RC_BASE}/oauth/authorize`,
						tokenUrl: `${RC_BASE}/oauth/token`,
						userInfoUrl: `${RC_BASE}/api/v1/profiles/me`,
						clientId: env.RC_CLIENT_ID,
						clientSecret: env.RC_CLIENT_SECRET,
						scopes: [],
						mapProfileToUser(profile) {
							const currentStint = profile.stints?.[profile.stints.length - 1]
							const batchName = currentStint?.batch?.name ?? null
							return {
								name: profile.name,
								rcFirstName: profile.first_name,
								rcLastName: profile.last_name,
								email: profile.email,
								image: profile.image_path,
								rcId: String(profile.id),
								github: profile.github ?? null,
								twitter: profile.twitter ?? null,
								linkedin: profile.linkedin ?? null,
								personalSiteUrl: profile.personal_site_url ?? null,
								batch: batchName,
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
				rcId: { type: "string", required: false, input: false },
				rcFirstName: { type: "string", required: false, input: false },
				rcLastName: { type: "string", required: false, input: false },
				accessControlUserId: { type: "string", required: false, input: false },
				accessControlVirtualCardId: { type: "string", required: false, input: false },
				github: { type: "string", required: false },
				twitter: { type: "string", required: false },
				linkedin: { type: "string", required: false },
				personalSiteUrl: { type: "string", required: false },
				batch: { type: "string", required: false },
			},
		},
		databaseHooks: {
			user: {
				create: {
					before: async (user) => {
						// believe it or not, all badges are in the same department as the staff!
						const RECURSE_CENTER_STAFF_DEPARTMENT_ID = 2;
						const RECURSE_CENTER_ACCESS_GROUP_ID = 2;
						const VIRTUAL_CARD_SITE_CODE = parseInt(env.VIRTUAL_CARD_SITE_CODE ?? "999");
						const VIRTUAL_CARD_PREFIX = parseInt(env.VIRTUAL_CARD_PREFIX ?? "99900000000");

						const response1 = await securityApi.POST("/v1/users", {
							body: {
								first_name: user.rcFirstName as string,
								last_name: user.rcLastName as string,
								access_group: RECURSE_CENTER_ACCESS_GROUP_ID,
								department: RECURSE_CENTER_STAFF_DEPARTMENT_ID,
								master_user: true,
								pin: undefined,
								notes: `Auto-provisioned for Recurse profile ${user.rcId}`,
							}
						});

						if (!response1.data?.ok) {
							console.log("Failed to provision user in security system:", response1);
							throw new Error(`Failed to provision user in security system.`);
						}

						const { user: provisionedUser } = response1.data;

						const response2 = await securityApi.POST("/v1/cards", {
							body: {
								site_code: VIRTUAL_CARD_SITE_CODE,
								card_code: String(VIRTUAL_CARD_PREFIX + parseInt(String(user.rcId))),
							}
						})

						if (!response2.data?.ok) {
							console.log("Failed to provision virtual card in security system:", response2);
							throw new Error(`Failed to provision virtual card in security system.`);
						}

						const { card: provisionedCard } = response2.data;

						const response3 = await securityApi.POST("/v1/cards/{id}/assign", {
							params: {
								path: {
									id: provisionedCard.id,
								},
							},
							body: {
								employee_id: provisionedUser.id,
							},
						});

						if (!response3.data?.ok) {
							console.log("Failed to assign virtual card to user in security system:", response3);
							throw new Error(`Failed to assign virtual card to user in security system.`);
						}

						return {
							data: {
								accessControlUserId: String(provisionedUser.id),
								accessControlVirtualCardId: String(provisionedCard.id),
								...user,
							}
						}
					},
				},
			},
		},
	})
}

export type Auth = ReturnType<typeof createAuth>
