type BatchGroupPerson = {
	name: string
	batch: string | null
	role: string | null
}

export type BatchGroup<T extends BatchGroupPerson> = {
	label: string
	people: T[]
}

const TERM_ORDER: Record<string, number> = {
	winter: 0,
	spring: 1,
	summer: 2,
	fall: 3,
}

function batchPosition(name: string): [number, number, number] | null {
	const match = name.match(
		/^(winter|spring|summer|fall)\s*(\d+)?\s*,?\s*(\d{4})$/i,
	)
	if (!match) return null

	return [
		Number(match[3]),
		TERM_ORDER[match[1]?.toLowerCase() ?? ""] ?? -1,
		Number(match[2] ?? 0),
	]
}

function compareBatchNames(a: string, b: string): number {
	if (a === "No batch") return b === "No batch" ? 0 : 1
	if (b === "No batch") return -1

	const aPosition = batchPosition(a)
	const bPosition = batchPosition(b)
	if (aPosition && bPosition) {
		for (let i = 0; i < aPosition.length; i += 1) {
			const difference = (bPosition[i] ?? 0) - (aPosition[i] ?? 0)
			if (difference !== 0) return difference
		}
	}
	if (aPosition) return -1
	if (bPosition) return 1
	return a.localeCompare(b, undefined, { sensitivity: "base" })
}

export function groupPeopleByBatch<T extends BatchGroupPerson>(
	people: T[],
): BatchGroup<T>[] {
	const groups = new Map<string, T[]>()
	const faculty: T[] = []

	for (const person of people) {
		if (person.role === "faculty") {
			faculty.push(person)
			continue
		}

		const label = person.batch ?? "No batch"
		const group = groups.get(label) ?? []
		group.push(person)
		groups.set(label, group)
	}

	const byFirstName = (a: T, b: T) =>
		a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
	const sections = [...groups.entries()]
		.sort(([a], [b]) => compareBatchNames(a, b))
		.map(([label, members]) => ({
			label,
			people: members.sort(byFirstName),
		}))

	if (faculty.length > 0) {
		sections.push({ label: "Faculty", people: faculty.sort(byFirstName) })
	}

	return sections
}
