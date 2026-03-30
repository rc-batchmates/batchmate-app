import createClient, { type Client } from "openapi-fetch"
import type { paths } from "./schema.js"

export type RecurseApiClient = Client<paths>

export function createRecurseApi(accessToken: string): RecurseApiClient {
	return createClient<paths>({
		baseUrl: "https://www.recurse.com/api/v1",
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	})
}

export type { components, paths } from "./schema.js"
