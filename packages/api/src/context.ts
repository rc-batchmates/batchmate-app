import type { Database } from "@batchmate/db"
import {
	createSecurityApi,
	type SecurityApiClient,
} from "@batchmate/security-api"
import { implement } from "@orpc/server"
import { contract } from "./contract"

export interface BaseContext {
	db: Database
	securityComputer: Fetcher
	user: { id: string; name: string; email: string } | null
	session: { id: string } | null
}

export interface Context extends Omit<BaseContext, "securityComputer"> {
	securityApi: SecurityApiClient
}

const base = implement(contract).$context<BaseContext>()

export const server = base.use(async ({ context, next }) => {
	return next({
		context: {
			securityApi: createSecurityApi(context.securityComputer),
		},
	})
})
