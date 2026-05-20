export const ImpactFeedbackStyle = {
	Light: "light",
	Medium: "medium",
	Heavy: "heavy",
} as const

export const NotificationFeedbackType = {
	Success: "success",
	Warning: "warning",
	Error: "error",
} as const

export async function impactAsync(_style?: string) {}
export async function notificationAsync(_type?: string) {}
export async function selectionAsync() {}
