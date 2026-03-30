import { oc } from "@orpc/contract"
import * as z from "zod"

export const FloorSchema = z.enum(["4", "5"])
export type Floor = z.infer<typeof FloorSchema>

export const EntrySchema = z.enum(["elevator", "stairs"])
export type Entry = z.infer<typeof EntrySchema>

const HubVisitorSchema = z.object({
	personId: z.number(),
	name: z.string(),
	imageUrl: z.string().nullable(),
	batch: z.string().nullable(),
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

export const contract = oc.router({
	health: oc.route({ method: "GET", path: "/health" }).output(
		z.object({
			status: z.string(),
			timestamp: z.string(),
		}),
	),
	doorsOpen: oc
		.route({ method: "POST", path: "/doors/open" })
		.input(
			z.object({
				floor: FloorSchema,
				entry: EntrySchema,
			}),
		)
		.output(
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
})

export type Contract = typeof contract
