// RC person IDs (the number in recurse.com/directory/<id>) of the people who
// manage the Snack Bar: SKUs, NFC tags, balances, payments and exports.
// RC IDs are used rather than auth user IDs because they're the same in
// every environment.
export const SNACK_BAR_ADMIN_RC_IDS: readonly number[] = [7212]

export function isSnackBarAdmin(rcId: string | null | undefined): boolean {
	if (!rcId) return false
	return SNACK_BAR_ADMIN_RC_IDS.includes(Number(rcId))
}
