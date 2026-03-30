import { server } from "./context"
import { doorsOpen } from "./procedures/doors-open"
import { health } from "./procedures/health"
import { hubCheckin } from "./procedures/hub-checkin"
import { hubVisits } from "./procedures/hub-visits"
import { memberProfile } from "./procedures/member-profile"

export const router = server.router({
	health,
	doorsOpen,
	hubVisits,
	hubCheckin,
	memberProfile,
})

export type Router = typeof router
