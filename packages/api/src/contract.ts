import { oc } from "@orpc/contract"
import * as z from "zod"

export const FloorSchema = z.enum(["4", "5", "all"])
export type Floor = z.infer<typeof FloorSchema>

export const EntrySchema = z.enum(["elevator", "stairs"])
export type Entry = z.infer<typeof EntrySchema>

export const DoorOpenInputSchema = z.object({
	floor: FloorSchema,
	entry: EntrySchema,
})
export type DoorOpenInput = z.infer<typeof DoorOpenInputSchema>

export const RecurseRoleSchema = z.enum(["current", "alumni", "faculty"])
export type RecurseRole = z.infer<typeof RecurseRoleSchema>

const HubVisitorSchema = z.object({
	personId: z.number(),
	name: z.string(),
	imageUrl: z.string().nullable(),
	batch: z.string().nullable(),
	stintType: z.string().nullable(),
	pronouns: z.string().nullable(),
	role: RecurseRoleSchema.nullable(),
	notes: z.string(),
	checkedInAt: z.string(),
})

const HubResponseSchema = z.object({
	isCheckedIn: z.boolean(),
	visitors: z.array(HubVisitorSchema),
})

export type HubVisitor = z.infer<typeof HubVisitorSchema>
export type HubResponse = z.infer<typeof HubResponseSchema>

const MemberProfileSchema = z.object({
	id: z.number(),
	firstName: z.string(),
	lastName: z.string(),
	name: z.string(),
	email: z.string().nullable(),
	imageUrl: z.string().nullable(),
	slug: z.string().nullable(),
	pronouns: z.string().nullable(),
	github: z.string().nullable(),
	twitter: z.string().nullable(),
	linkedin: z.string().nullable(),
	personalSiteUrl: z.string().nullable(),
	zulipId: z.number().nullable(),
	bio: z.string().nullable(),
	interests: z.string().nullable(),
	beforeRc: z.string().nullable(),
	duringRc: z.string().nullable(),
	batch: z.string().nullable(),
	currentLocation: z.string().nullable(),
	company: z.string().nullable(),
})

export type MemberProfile = z.infer<typeof MemberProfileSchema>

const DirectoryPersonSchema = z.object({
	id: z.number(),
	name: z.string(),
	imageUrl: z.string().nullable(),
	batch: z.string().nullable(),
	stintType: z.string().nullable(),
	pronouns: z.string().nullable(),
	role: RecurseRoleSchema.nullable(),
})

const DirectoryResponseSchema = z.object({
	people: z.array(DirectoryPersonSchema),
})

export type DirectoryPerson = z.infer<typeof DirectoryPersonSchema>
export type DirectoryResponse = z.infer<typeof DirectoryResponseSchema>

const BatchSchema = z.object({
	id: z.number(),
	name: z.string(),
	shortName: z.string().nullable(),
})

const BatchesResponseSchema = z.array(BatchSchema)

export type Batch = z.infer<typeof BatchSchema>

const LocationSchema = z.object({
	id: z.number(),
	name: z.string(),
})

const LocationsResponseSchema = z.array(LocationSchema)

export type Location = z.infer<typeof LocationSchema>

const ZoomRoomSchema = z.object({
	slug: z.string(),
	label: z.string(),
	directUrl: z.string(),
})

const ZoomRoomsResponseSchema = z.array(ZoomRoomSchema)

export type ZoomRoom = z.infer<typeof ZoomRoomSchema>

const PresentationSchema = z.object({
	id: z.string(),
	presenter: z.string(),
	title: z.string(),
	date: z.number().nullable(),
	lastUpdated: z.number().nullable(),
})

const PresentationsListResponseSchema = z.object({
	sessionStartMs: z.number(),
	windowStartMs: z.number(),
	windowEndMs: z.number(),
	maxSignUps: z.number(),
	presentations: z.array(PresentationSchema),
})

const PresentationsCreateInputSchema = z.object({
	presenter: z.string().min(1),
	title: z.string(),
})

const PresentationsUpdateInputSchema = z.object({
	id: z.string().min(1),
	presenter: z.string().min(1).optional(),
	title: z.string().optional(),
})

const PresentationsDeleteInputSchema = z.object({
	id: z.string().min(1),
})

export type Presentation = z.infer<typeof PresentationSchema>
export type PresentationsListResponse = z.infer<
	typeof PresentationsListResponseSchema
>

export const contract = oc.router({
	health: oc.route({ method: "GET", path: "/health" }).output(
		z.object({
			status: z.string(),
			timestamp: z.string(),
		}),
	),
	doorsOpen: oc
		.route({ method: "POST", path: "/doors/open" })
		.input(DoorOpenInputSchema)
		.output(
			z.object({
				success: z.boolean(),
			}),
		),
	intercomOpen: oc.route({ method: "POST", path: "/doors/intercom" }).output(
		z.object({
			success: z.boolean(),
		}),
	),
	hubVisits: oc
		.route({ method: "GET", path: "/hub" })
		.output(HubResponseSchema),
	hubCheckin: oc
		.route({ method: "POST", path: "/hub/checkin" })
		.output(z.object({ success: z.boolean() })),
	memberProfile: oc
		.route({ method: "GET", path: "/members/{id}" })
		.input(z.object({ id: z.coerce.number() }))
		.output(MemberProfileSchema),
	directorySearch: oc
		.route({ method: "GET", path: "/directory" })
		.input(
			z.object({
				query: z.string().optional(),
				batchId: z.coerce.number().optional(),
				locationId: z.coerce.number().optional(),
				role: z.enum(["recurser", "resident", "faculty"]).optional(),
				scope: z.enum(["current", "overlap", "ngw"]).optional(),
				limit: z.coerce.number().optional(),
				offset: z.coerce.number().optional(),
			}),
		)
		.output(DirectoryResponseSchema),
	batches: oc
		.route({ method: "GET", path: "/batches" })
		.output(BatchesResponseSchema),
	locations: oc
		.route({ method: "GET", path: "/locations" })
		.input(z.object({ query: z.string().optional() }))
		.output(LocationsResponseSchema),
	zoomRooms: oc
		.route({ method: "GET", path: "/zoom-rooms" })
		.output(ZoomRoomsResponseSchema),
	presentationsList: oc
		.route({ method: "GET", path: "/presentations" })
		.output(PresentationsListResponseSchema),
	presentationsCreate: oc
		.route({ method: "POST", path: "/presentations" })
		.input(PresentationsCreateInputSchema)
		.output(PresentationSchema),
	presentationsUpdate: oc
		.route({ method: "PATCH", path: "/presentations/{id}" })
		.input(PresentationsUpdateInputSchema)
		.output(z.object({ success: z.boolean() })),
	presentationsDelete: oc
		.route({ method: "DELETE", path: "/presentations/{id}" })
		.input(PresentationsDeleteInputSchema)
		.output(z.object({ success: z.boolean() })),
})

export type Contract = typeof contract
