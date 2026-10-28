/**
 * Local-only mock of the door/security computer API.
 *
 * The production API talks to a real security computer over a Cloudflare VPC
 * service binding (`SECURITY_COMPUTER`). That binding is `remote = true` and has
 * no local emulation, so it's omitted from the API's `local` wrangler env to keep
 * `pnpm dev:local` offline (no Cloudflare login). This worker stands in for it via
 * a service binding, returning the minimal `{ ok: true, ... }` shapes the app
 * expects so first-login user provisioning (`packages/auth`) and door-open
 * simulation (`doors-open` procedure) succeed locally.
 *
 * Each response is assigned to a local variable whose type is taken from
 * `@batchmate/security-api` (the generated OpenAPI schema), so `pnpm build`
 * (tsc --noEmit) fails if a mocked value drifts from the contract. Values are fake.
 */

import type { components, paths } from "@batchmate/security-api"

// Response body types, taken straight from the generated schema.
type CreateUserResponse =
	paths["/v1/users"]["post"]["responses"][201]["content"]["application/json"]
type CreateCardResponse =
	paths["/v1/cards"]["post"]["responses"][201]["content"]["application/json"]
type LookupCardResponse =
	paths["/v1/cards/lookup/{site_code}/{card_code}"]["get"]["responses"][200]["content"]["application/json"]
type SuccessResponse = components["schemas"]["SuccessResponse"]

const json = (body: unknown, status = 200): Response =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	})

// Fixed fake ids — fine for single-user local dev.
const MOCK_USER_ID = 1_000_001
const MOCK_CARD_ID = 2_000_001

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url)
		const { method } = request
		const path = url.pathname
		console.log(`[security-mock] ${method} ${path}`)

		const body = (await request
			.clone()
			.json()
			.catch(() => ({}))) as Record<string, unknown>

		// POST /v1/users — provision a user
		if (method === "POST" && path === "/v1/users") {
			const response: CreateUserResponse = {
				ok: true,
				user: {
					id: MOCK_USER_ID,
					first_name: String(body.first_name ?? "Local"),
					last_name: String(body.last_name ?? "Dev"),
					department: Number(body.department ?? 2),
					access_group: Number(body.access_group ?? 2),
					master_user: Boolean(body.master_user ?? true),
				},
			}
			return json(response, 201)
		}

		// POST /v1/cards — create a virtual card
		if (method === "POST" && path === "/v1/cards") {
			const response: CreateCardResponse = {
				ok: true,
				card: {
					id: MOCK_CARD_ID,
					site_code: Number(body.site_code ?? 999),
					card_code: String(body.card_code ?? "0"),
					status: "active",
					employee_id: 0,
				},
			}
			return json(response, 201)
		}

		// GET /v1/cards/lookup/{site_code}/{card_code} — lookup existing card
		const lookup = path.match(/^\/v1\/cards\/lookup\/(\d+)\/(.+)$/)
		if (method === "GET" && lookup) {
			const response: LookupCardResponse = {
				ok: true,
				card: {
					id: MOCK_CARD_ID,
					site_code: Number(lookup[1]),
					card_code: lookup[2],
					status: "active",
					employee_id: 0,
				},
			}
			return json(response, 200)
		}

		// POST /v1/cards/{id}/assign and /v1/cards/{id}/simulate — success
		if (
			method === "POST" &&
			/^\/v1\/cards\/\d+\/(assign|simulate)$/.test(path)
		) {
			const response: SuccessResponse = { ok: true }
			return json(response)
		}

		// Anything else: succeed so the mock never blocks a local flow.
		console.log(`[security-mock] unhandled ${method} ${path} -> ok`)
		const response: SuccessResponse = { ok: true }
		return json(response)
	},
}
