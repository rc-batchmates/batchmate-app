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
	visitors: z.array(HubVisitorSchema),
})

const IsCheckedInSchema = z.object({
	isCheckedIn: z.boolean(),
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

const SnackSkuSchema = z.object({
	id: z.string(),
	name: z.string(),
	priceCents: z.number().int(),
	archived: z.boolean(),
})

const SnackLedgerEntrySchema = z.object({
	id: z.string(),
	kind: z.enum(["purchase", "payment"]),
	skuId: z.string().nullable(),
	skuName: z.string().nullable(),
	quantity: z.number().int(),
	// Purchases: price per snack. Payments: same as amountCents.
	unitPriceCents: z.number().int(),
	amountCents: z.number().int(),
	source: z.enum(["nfc", "web", "admin"]),
	note: z.string().nullable(),
	recordedByName: z.string().nullable(),
	createdAt: z.string(),
	voidedAt: z.string().nullable(),
	canVoid: z.boolean(),
})

const SnackBarSummarySchema = z.object({
	balanceCents: z.number().int(),
	isAdmin: z.boolean(),
})

const SnackLedgerPageSchema = z.object({
	entries: z.array(SnackLedgerEntrySchema),
	nextCursor: z.string().nullable(),
})

const SnackLedgerMutationResponseSchema = z.object({
	entry: SnackLedgerEntrySchema,
	balanceCents: z.number().int(),
})

const SnackAccountSchema = z.object({
	userId: z.string(),
	name: z.string(),
	image: z.string().nullable(),
	rcId: z.string().nullable(),
	balanceCents: z.number().int(),
	lastActivityAt: z.string(),
})

const SnackPriceCentsSchema = z.number().int().min(0).max(100_000)

export type SnackSku = z.infer<typeof SnackSkuSchema>
export type SnackLedgerEntry = z.infer<typeof SnackLedgerEntrySchema>
export type SnackBarSummary = z.infer<typeof SnackBarSummarySchema>
export type SnackAccount = z.infer<typeof SnackAccountSchema>

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
	isCheckedIn: oc
		.route({ method: "GET", path: "/hub/is-checked-in" })
		.output(IsCheckedInSchema),
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
	snackBarSummary: oc
		.route({ method: "GET", path: "/snack-bar" })
		.output(SnackBarSummarySchema),
	snackBarTransactions: oc
		.route({ method: "GET", path: "/snack-bar/transactions" })
		.input(
			z.object({
				cursor: z.string().optional(),
				limit: z.coerce.number().int().min(1).max(100).optional(),
			}),
		)
		.output(SnackLedgerPageSchema),
	snackBarTransaction: oc
		.route({ method: "GET", path: "/snack-bar/transactions/{id}" })
		.input(z.object({ id: z.string().min(1) }))
		.output(SnackLedgerEntrySchema),
	snackBarPurchase: oc
		.route({ method: "POST", path: "/snack-bar/purchases" })
		.input(
			z.object({
				skuId: z.string().min(1),
				// Lives in the snack link's URL, so keep it URL-safe.
				idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
				source: z.enum(["nfc", "web"]),
			}),
		)
		.output(SnackLedgerMutationResponseSchema),
	snackBarBuyAnother: oc
		.route({
			method: "POST",
			path: "/snack-bar/transactions/{id}/buy-another",
		})
		.input(
			z.object({
				id: z.string().min(1),
				// The quantity the client last saw. If the entry has already moved
				// past it (a retried or double-sent tap), nothing is added and the
				// current entry is returned.
				expectedQuantity: z.number().int().min(1),
			}),
		)
		.output(SnackLedgerMutationResponseSchema),
	snackBarVoid: oc
		.route({ method: "DELETE", path: "/snack-bar/transactions/{id}" })
		.input(z.object({ id: z.string().min(1) }))
		.output(SnackLedgerMutationResponseSchema),
	snackBarSku: oc
		.route({ method: "GET", path: "/snack-bar/skus/{id}" })
		.input(z.object({ id: z.string().min(1) }))
		.output(SnackSkuSchema),
	snackBarAdminSkus: oc
		.route({ method: "GET", path: "/snack-bar/admin/skus" })
		.output(z.array(SnackSkuSchema)),
	snackBarAdminSkuCreate: oc
		.route({ method: "POST", path: "/snack-bar/admin/skus" })
		.input(
			z.object({
				name: z.string().trim().min(1).max(80),
				priceCents: SnackPriceCentsSchema,
			}),
		)
		.output(SnackSkuSchema),
	snackBarAdminSkuUpdate: oc
		.route({ method: "PATCH", path: "/snack-bar/admin/skus/{id}" })
		.input(
			z.object({
				id: z.string().min(1),
				name: z.string().trim().min(1).max(80).optional(),
				priceCents: SnackPriceCentsSchema.optional(),
				archived: z.boolean().optional(),
			}),
		)
		.output(SnackSkuSchema),
	snackBarAdminAccounts: oc
		.route({ method: "GET", path: "/snack-bar/admin/accounts" })
		.input(
			z.object({
				// "unsettled" (default): non-zero balances. "all": anyone with history.
				scope: z.enum(["unsettled", "all"]).optional(),
			}),
		)
		.output(z.array(SnackAccountSchema)),
	snackBarAdminAccount: oc
		.route({ method: "GET", path: "/snack-bar/admin/accounts/{userId}" })
		.input(z.object({ userId: z.string().min(1) }))
		.output(
			z.object({
				account: SnackAccountSchema,
				entries: z.array(SnackLedgerEntrySchema),
			}),
		),
	snackBarAdminPayment: oc
		.route({
			method: "POST",
			path: "/snack-bar/admin/accounts/{userId}/payments",
		})
		.input(
			z.object({
				userId: z.string().min(1),
				amountCents: SnackPriceCentsSchema.refine((n) => n > 0),
				note: z.string().trim().max(200).optional(),
				// Who the money was handed or Venmo'd to.
				recipient: z.string().trim().max(100).optional(),
			}),
		)
		.output(SnackLedgerMutationResponseSchema),
	snackBarAdminVoid: oc
		.route({ method: "DELETE", path: "/snack-bar/admin/transactions/{id}" })
		.input(z.object({ id: z.string().min(1) }))
		.output(SnackLedgerMutationResponseSchema),
	snackBarAdminExport: oc
		.route({ method: "GET", path: "/snack-bar/admin/export" })
		.input(
			z.object({
				userId: z.string().optional(),
				// Inclusive YYYY-MM-DD dates in America/New_York.
				from: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/)
					.optional(),
				to: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/)
					.optional(),
			}),
		)
		.output(z.object({ filename: z.string(), csv: z.string() })),
})

export type Contract = typeof contract
