import type { RecurseRole } from "../contract"

type StintLike = {
	type?: string | null
	in_progress?: boolean | null
}

export function getRoleFromStints(
	stints: StintLike[] | null | undefined,
): RecurseRole {
	if (!stints || stints.length === 0) return "alumni"
	if (stints.some((s) => s.type === "employment" && s.in_progress))
		return "faculty"
	if (stints.some((s) => s.type === "retreat" && s.in_progress))
		return "current"
	return "alumni"
}

export function getRoleFromCachedStint(
	stintType: string | null,
	inProgress: boolean | null,
): RecurseRole | null {
	if (stintType === null || inProgress === null) return null
	if (stintType === "employment" && inProgress) return "faculty"
	if (stintType === "retreat" && inProgress) return "current"
	return "alumni"
}
