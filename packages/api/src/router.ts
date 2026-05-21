import { server } from "./context"
import { batches } from "./procedures/batches"
import { directorySearch } from "./procedures/directory-search"
import { doorsOpen } from "./procedures/doors-open"
import { health } from "./procedures/health"
import { hubCheckin } from "./procedures/hub-checkin"
import { hubVisits } from "./procedures/hub-visits"
import { intercomOpen } from "./procedures/intercom-open"
import { locations } from "./procedures/locations"
import { memberProfile } from "./procedures/member-profile"
import { zoomRooms } from "./procedures/zoom-rooms"

export const router = server.router({
	health,
	doorsOpen,
	intercomOpen,
	hubVisits,
	hubCheckin,
	memberProfile,
	directorySearch,
	batches,
	locations,
	zoomRooms,
})

export type Router = typeof router
