import { server } from "../context"

export const health = server.health.handler(async () => ({
	status: "ok",
	timestamp: new Date().toISOString(),
}))
