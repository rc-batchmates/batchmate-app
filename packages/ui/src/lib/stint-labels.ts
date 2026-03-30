export const stintTypeLabels: Record<string, string> = {
	retreat: "Recurser",
	residency: "Resident",
	research_fellowship: "Research Fellow",
	employment: "Faculty",
	facilitatorship: "Facilitator",
}

export function getSubtitle(
	batch: string | null,
	stintType: string | null,
): string {
	return batch ?? (stintType ? stintTypeLabels[stintType] : null) ?? "Recurser"
}

export function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase()
}
