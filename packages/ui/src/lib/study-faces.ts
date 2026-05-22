import {
	type Card,
	createEmptyCard,
	FSRS,
	generatorParameters,
	Rating,
} from "ts-fsrs"

export type { Card } from "ts-fsrs"
export { Rating } from "ts-fsrs"

export const fsrs = new FSRS(generatorParameters())

export const STUDY_FACES_MIN_REPEAT_GAP = 4
export const STUDY_FACES_DIRECTORY_LIMIT = 50
export const STUDY_FACES_ALL_MAX_PAGES = 4
export const STUDY_FACES_REVEAL_DELAY_MS = 400
export const STUDY_FACES_ADVANCE_CORRECT_MS = 550
export const STUDY_FACES_ANNOUNCEMENT_MS = 1500

export const STUDY_FACES_STORAGE_KEYS = {
	cards: "study-faces:cards",
	confusion: "study-faces:confusion",
	streak: "study-faces:streak",
	active: "study-faces:active",
} as const

export type StudyFacesMode = "hub" | "batch" | "all"

export const STUDY_FACES_MODE_LABELS: { id: StudyFacesMode; label: string }[] =
	[
		{ id: "hub", label: "In hub" },
		{ id: "batch", label: "In batch" },
		{ id: "all", label: "All" },
	]

export type StudyFacesChallengeType = "face-to-name" | "name-to-face"

export type StudyFacesRole = "current" | "alumni" | "faculty"

export type StudyFacesPerson = {
	personId: number
	name: string
	firstName: string
	imageUrl: string | null
	batch: string | null
	stintType: string | null
	pronouns: string | null
	role: StudyFacesRole | null
}

export const STUDY_FACES_STREAK_MILESTONES: Record<
	number,
	{ name: string; color: string }
> = {
	8: { name: "🐙", color: "#0088d2" },
	16: { name: "WICKED", color: "#645dac" },
	32: { name: "FANTASTIC", color: "#cb1f47" },
	64: { name: "🐙🐙", color: "#f56f02" },
	128: { name: "R-R-R-RECURSIVE", color: "#e83e8c" },
	256: { name: "INCONCEIVABLE", color: "#00b345" },
	512: { name: "🐙🐙🐙", color: "#0088d2" },
	1024: { name: "UNFRIGGINBELIEVABLE", color: "#645dac" },
	2048: { name: "GODLIKE", color: "#cb1f47" },
}

const MILESTONE_KEYS = Object.keys(STUDY_FACES_STREAK_MILESTONES)
	.map(Number)
	.sort((a, b) => a - b)
const MAX_MILESTONE = MILESTONE_KEYS[MILESTONE_KEYS.length - 1] ?? 0

export const STUDY_FACES_MILESTONE_KEYS = MILESTONE_KEYS
export const STUDY_FACES_MAX_MILESTONE = MAX_MILESTONE

export type StudyFacesCardStates = Record<string, Card>
export type StudyFacesConfusionMatrix = Record<string, Record<string, number>>

export type StudyFacesActiveChallenge = {
	correctId: number
	type: StudyFacesChallengeType
	optionIds: number[]
	hasErrored: boolean
}

export type StudyFacesChallenge = {
	type: StudyFacesChallengeType
	correct: StudyFacesPerson
	options: StudyFacesPerson[]
}

export function studyFacesCardKey(
	personId: number,
	type: StudyFacesChallengeType,
): string {
	return `${personId}:${type}`
}

export function studyFacesGetCard(
	states: StudyFacesCardStates,
	personId: number,
	type: StudyFacesChallengeType,
): Card {
	const key = studyFacesCardKey(personId, type)
	let card = states[key]
	if (!card) {
		card = createEmptyCard()
		states[key] = card
	}
	// Dates from JSON.parse arrive as strings; rehydrate
	if (!(card.due instanceof Date)) card.due = new Date(card.due)
	if (card.last_review && !(card.last_review instanceof Date)) {
		card.last_review = new Date(card.last_review)
	}
	return card
}

export function studyFacesFirstName(name: string): string {
	const trimmed = name.trim()
	const idx = trimmed.indexOf(" ")
	return idx === -1 ? trimmed : trimmed.slice(0, idx)
}

// FSRS difficulty: 1 (easiest) → 10 (hardest)
// New or hard cards get fewer options; well-known cards get more.
function numCandidates(card: Card, maxAvailable: number): number {
	const d = card.difficulty
	let requested: number
	if (card.state === 0 || d >= 7) requested = 2
	else if (d >= 5) requested = 4
	else requested = 6
	return Math.min(requested, maxAvailable)
}

function shuffle<T>(arr: T[]): T[] {
	const out = [...arr]
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[out[i], out[j]] = [out[j], out[i]]
	}
	return out
}

export function studyFacesBuildChallenge(
	people: StudyFacesPerson[],
	states: StudyFacesCardStates,
	confusion: StudyFacesConfusionMatrix,
	recent: number[],
): StudyFacesChallenge | null {
	const now = new Date()
	if (people.length < 2) return null

	type Candidate = { profile: StudyFacesPerson; type: StudyFacesChallengeType }
	const all: Candidate[] = []
	for (const p of people) {
		all.push({ profile: p, type: "face-to-name" })
		all.push({ profile: p, type: "name-to-face" })
	}

	const withGap = (cards: Candidate[]) =>
		cards.filter((c) => !recent.includes(c.profile.personId))

	const news = all.filter(
		(c) => studyFacesGetCard(states, c.profile.personId, c.type).state === 0,
	)
	let selected: Candidate | undefined
	if (news.length > 0) {
		const pool = withGap(news)
		const eligible = pool.length > 0 ? pool : news
		selected = eligible[Math.floor(Math.random() * eligible.length)]
	} else {
		const dues = all.filter(
			(c) => studyFacesGetCard(states, c.profile.personId, c.type).due <= now,
		)
		const sortByDue = (cards: Candidate[]) =>
			[...cards].sort(
				(a, b) =>
					studyFacesGetCard(states, a.profile.personId, a.type).due.getTime() -
					studyFacesGetCard(states, b.profile.personId, b.type).due.getTime(),
			)
		if (dues.length > 0) {
			const pool = withGap(dues)
			selected = sortByDue(pool.length > 0 ? pool : dues)[0]
		} else {
			const pool = withGap(all)
			selected = sortByDue(pool.length > 0 ? pool : all)[0]
		}
	}
	if (!selected) return null

	const correct = selected.profile
	const card = studyFacesGetCard(states, correct.personId, selected.type)
	const distractorsNeeded = numCandidates(card, people.length) - 1

	const distractors: StudyFacesPerson[] = []
	const usedFirstNames = new Set([correct.firstName])

	// Priority 0: known confusions
	const personConf = confusion[String(correct.personId)] ?? {}
	const confusionOrder = Object.entries(personConf)
		.sort((a, b) => b[1] - a[1])
		.map(([id]) => people.find((p) => String(p.personId) === id))
		.filter((p): p is StudyFacesPerson => Boolean(p))
	for (const p of confusionOrder) {
		if (distractors.length >= distractorsNeeded) break
		if (p.personId === correct.personId) continue
		if (!usedFirstNames.has(p.firstName)) {
			distractors.push(p)
			usedFirstNames.add(p.firstName)
		}
	}

	// Priority 1: same pronouns + unique firstName (matches rc-srs behaviour)
	const shuffled = shuffle(people)
	for (const p of shuffled) {
		if (distractors.length >= distractorsNeeded) break
		if (p.personId === correct.personId) continue
		if (distractors.some((d) => d.personId === p.personId)) continue
		if (p.pronouns === correct.pronouns && !usedFirstNames.has(p.firstName)) {
			distractors.push(p)
			usedFirstNames.add(p.firstName)
		}
	}

	// Priority 2: any + unique firstName
	for (const p of shuffled) {
		if (distractors.length >= distractorsNeeded) break
		if (p.personId === correct.personId) continue
		if (distractors.some((d) => d.personId === p.personId)) continue
		if (!usedFirstNames.has(p.firstName)) {
			distractors.push(p)
			usedFirstNames.add(p.firstName)
		}
	}

	// Priority 3 (fallback): allow duplicate first names if we still need more
	if (distractors.length < distractorsNeeded) {
		for (const p of shuffled) {
			if (distractors.length >= distractorsNeeded) break
			if (p.personId === correct.personId) continue
			if (distractors.some((d) => d.personId === p.personId)) continue
			distractors.push(p)
		}
	}

	if (distractors.length < 1) return null

	return {
		type: selected.type,
		correct,
		options: shuffle([correct, ...distractors]),
	}
}

export function studyFacesComputeCounts(
	people: StudyFacesPerson[],
	states: StudyFacesCardStates,
): { due: number; fresh: number } {
	const now = new Date()
	let due = 0
	let fresh = 0
	for (const p of people) {
		for (const type of ["face-to-name", "name-to-face"] as const) {
			const card = studyFacesGetCard(states, p.personId, type)
			if (card.state === 0) fresh++
			else if (card.due <= now) due++
		}
	}
	return { due, fresh }
}

export type StudyFacesStreakProgress = {
	prev: number
	next: number
	progress: number
	prevColor: string
	nextColor: string
	shakeIntensity: number
}

export function studyFacesStreakProgress(
	streak: number,
): StudyFacesStreakProgress {
	if (streak <= 0 || MILESTONE_KEYS.length === 0) {
		return {
			prev: 0,
			next: MILESTONE_KEYS[0] ?? 1,
			progress: 0,
			prevColor: "#1e293b",
			nextColor: "#22d3ee",
			shakeIntensity: 0,
		}
	}
	const milestones = [0, ...MILESTONE_KEYS]
	const cyclic = ((streak - 1) % MAX_MILESTONE) + 1
	const prev = [...milestones].reverse().find((m) => m < cyclic) ?? 0
	const next = milestones.find((m) => m >= cyclic) ?? MAX_MILESTONE
	const progress = ((cyclic - prev) / (next - prev)) * 100
	return {
		prev,
		next,
		progress,
		prevColor: STUDY_FACES_STREAK_MILESTONES[prev]?.color ?? "#1e293b",
		nextColor: STUDY_FACES_STREAK_MILESTONES[next]?.color ?? "#22d3ee",
		shakeIntensity: Math.min(Math.floor(streak / 5), 5),
	}
}

export function studyFacesScheduleCorrect(
	states: StudyFacesCardStates,
	personId: number,
	type: StudyFacesChallengeType,
	now: Date = new Date(),
): void {
	const key = studyFacesCardKey(personId, type)
	const card = studyFacesGetCard(states, personId, type)
	states[key] = fsrs.repeat(card, now)[Rating.Good].card
}

export function studyFacesScheduleIncorrect(
	states: StudyFacesCardStates,
	targetId: number,
	targetType: StudyFacesChallengeType,
	distractorId: number,
	now: Date = new Date(),
): void {
	const targetKey = studyFacesCardKey(targetId, targetType)
	const targetCard = studyFacesGetCard(states, targetId, targetType)
	states[targetKey] = fsrs.repeat(targetCard, now)[Rating.Again].card
	for (const dir of ["face-to-name", "name-to-face"] as const) {
		const k = studyFacesCardKey(distractorId, dir)
		const c = studyFacesGetCard(states, distractorId, dir)
		states[k] = fsrs.repeat(c, now)[Rating.Again].card
	}
}

export function studyFacesRecordConfusion(
	confusion: StudyFacesConfusionMatrix,
	targetId: number,
	distractorId: number,
): void {
	const t = String(targetId)
	const d = String(distractorId)
	confusion[t] = confusion[t] ?? {}
	confusion[t][d] = (confusion[t][d] ?? 0) + 1
	confusion[d] = confusion[d] ?? {}
	confusion[d][t] = (confusion[d][t] ?? 0) + 1
}

export function studyFacesPickMilestone(
	streak: number,
): { name: string; color: string } | null {
	const m = STUDY_FACES_STREAK_MILESTONES[streak]
	if (m) return m
	if (streak > MAX_MILESTONE && streak % 5 === 0) {
		return STUDY_FACES_STREAK_MILESTONES[MAX_MILESTONE] ?? null
	}
	return null
}
