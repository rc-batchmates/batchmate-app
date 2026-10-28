import { server } from "./context"
import { batches } from "./procedures/batches"
import { directorySearch } from "./procedures/directory-search"
import { doorsOpen } from "./procedures/doors-open"
import { health } from "./procedures/health"
import { hubCheckin } from "./procedures/hub-checkin"
import { hubVisits, isCheckedIn } from "./procedures/hub-visits"
import { intercomOpen } from "./procedures/intercom-open"
import { locations } from "./procedures/locations"
import { memberProfile } from "./procedures/member-profile"
import { presentationsCreate } from "./procedures/presentations-create"
import { presentationsDelete } from "./procedures/presentations-delete"
import { presentationsList } from "./procedures/presentations-list"
import { presentationsUpdate } from "./procedures/presentations-update"
import { zoomRooms } from "./procedures/zoom-rooms"

export const router = server.router({
	health,
	doorsOpen,
	intercomOpen,
	hubVisits,
	isCheckedIn,
	hubCheckin,
	memberProfile,
	directorySearch,
	batches,
	locations,
	zoomRooms,
	presentationsList,
	presentationsCreate,
	presentationsUpdate,
	presentationsDelete,
})

export type Router = typeof router
