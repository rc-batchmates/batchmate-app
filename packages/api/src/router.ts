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
import { snackBarAdminAccount } from "./procedures/snack-bar-admin-account"
import { snackBarAdminAccounts } from "./procedures/snack-bar-admin-accounts"
import { snackBarAdminExport } from "./procedures/snack-bar-admin-export"
import { snackBarAdminPayment } from "./procedures/snack-bar-admin-payment"
import { snackBarAdminSkuCreate } from "./procedures/snack-bar-admin-sku-create"
import { snackBarAdminSkuUpdate } from "./procedures/snack-bar-admin-sku-update"
import { snackBarAdminSkus } from "./procedures/snack-bar-admin-skus"
import { snackBarAdminVoid } from "./procedures/snack-bar-admin-void"
import { snackBarBuyAnother } from "./procedures/snack-bar-buy-another"
import { snackBarPurchase } from "./procedures/snack-bar-purchase"
import { snackBarSku } from "./procedures/snack-bar-sku"
import { snackBarSummary } from "./procedures/snack-bar-summary"
import { snackBarTransaction } from "./procedures/snack-bar-transaction"
import { snackBarTransactions } from "./procedures/snack-bar-transactions"
import { snackBarVoid } from "./procedures/snack-bar-void"
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
	snackBarSummary,
	snackBarTransactions,
	snackBarTransaction,
	snackBarPurchase,
	snackBarBuyAnother,
	snackBarVoid,
	snackBarSku,
	snackBarAdminSkus,
	snackBarAdminSkuCreate,
	snackBarAdminSkuUpdate,
	snackBarAdminAccounts,
	snackBarAdminAccount,
	snackBarAdminPayment,
	snackBarAdminVoid,
	snackBarAdminExport,
})

export type Router = typeof router
