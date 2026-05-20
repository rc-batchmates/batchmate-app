import { contract } from "@batchmate/api/contract"
import type { Router } from "@batchmate/api/router"
import { getCookie } from "@better-auth/expo/client"
import { createORPCClient } from "@orpc/client"
import { OpenAPILink } from "@orpc/openapi-client/fetch"
import type { RouterClient } from "@orpc/server"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import * as SecureStore from "expo-secure-store"
import { apiUrl } from "./api-url"

const link = new OpenAPILink(contract, {
	url: `${apiUrl}/api/v1`,
	fetch: async (input, init) => {
		const cookieJson = SecureStore.getItem("batchmate_cookie") || "{}"
		const cookie = getCookie(cookieJson)
		const headers = new Headers(
			input instanceof Request ? input.headers : init?.headers,
		)
		if (cookie) {
			headers.set("cookie", cookie)
		}
		return fetch(input, { ...init, headers })
	},
})

const client: RouterClient<Router> = createORPCClient(link)

export const api = createTanstackQueryUtils(client)
