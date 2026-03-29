import createClient, { type Client } from "openapi-fetch"
import type { paths } from "./schema.js"

export type SecurityApiClient = Client<paths>

export function createSecurityApi(fetcher: Fetcher): SecurityApiClient {
	return createClient<paths>({
		baseUrl: "http://security-computer",
		fetch: (input) => fetcher.fetch(input as Request),
	})
}

export type { components, paths } from "./schema.js"
