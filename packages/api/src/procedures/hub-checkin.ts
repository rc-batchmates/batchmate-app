import { account } from "@batchmate/db/auth-schema"
import { ORPCError } from "@orpc/server"
import { and, eq } from "drizzle-orm"
import { server } from "../context"

export const hubCheckin = server.hubCheckin.handler(async ({ context }) => {
	if (!context.user) {
		throw new ORPCError("UNAUTHORIZED")
	}

	if (!context.recurseApi) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Recurse API not available",
		})
	}

	// Get the user's RC ID from the account table
	const rcAccount = await context.db
		.select({ accountId: account.accountId })
		.from(account)
		.where(
			and(
				eq(account.userId, context.user.id),
				eq(account.providerId, "recurse"),
			),
		)
		.get()

	if (!rcAccount) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Recurse account not found",
		})
	}

	const today = new Date().toLocaleDateString("en-CA", {
		timeZone: "America/New_York",
	})

	const { error } = await context.recurseApi.PATCH(
		"/hub_visits/{person_id}/{date}",
		{
			params: {
				path: {
					person_id: Number(rcAccount.accountId),
					date: today,
				},
			},
			body: {
				app_data: JSON.stringify({ source: "batchmate.app" }),
			},
		},
	)

	if (error) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Failed to check in",
		})
	}

	return { success: true }
})
