import { AVATAR_FACE_OBJECT_POSITION, getSubtitle } from "@batchmate/ui"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
} from "@tanstack/react-router"
import { ChevronLeft, User } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
	type Card,
	createEmptyCard,
	FSRS,
	generatorParameters,
	Rating,
} from "ts-fsrs"
import { PageLayout } from "@/components/page-layout"
import { api } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth"

const fsrs = new FSRS(generatorParameters())
const MIN_REPEAT_GAP = 4
const DIRECTORY_LIMIT = 50
const ALL_MAX_PAGES = 4
const REVEAL_DELAY_MS = 400
const ADVANCE_CORRECT_MS = 550
const STORAGE_CARDS = "study-faces:cards"
const STORAGE_CONFUSION = "study-faces:confusion"
const STORAGE_STREAK = "study-faces:streak"
const STORAGE_ACTIVE = "study-faces:active"

type Mode = "hub" | "batch" | "all"
const MODE_LABELS: { id: Mode; label: string }[] = [
	{ id: "hub", label: "In hub" },
	{ id: "batch", label: "In batch" },
	{ id: "all", label: "All" },
]

type ChallengeType = "face-to-name" | "name-to-face"

type Role = "current" | "alumni" | "faculty"

type Person = {
	personId: number
	name: string
	firstName: string
	imageUrl: string | null
	batch: string | null
	stintType: string | null
	pronouns: string | null
	role: Role | null
}

const STREAK_MILESTONES: Record<number, { name: string; color: string }> = {
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
const MILESTONE_KEYS = Object.keys(STREAK_MILESTONES)
	.map(Number)
	.sort((a, b) => a - b)
const MAX_MILESTONE = MILESTONE_KEYS[MILESTONE_KEYS.length - 1] ?? 0

type CardStates = Record<string, Card>
type ConfusionMatrix = Record<string, Record<string, number>>

type ActiveChallenge = {
	correctId: number
	type: ChallengeType
	optionIds: number[]
	hasErrored: boolean
}

type Challenge = {
	type: ChallengeType
	correct: Person
	options: Person[]
}

function loadJSON<T>(key: string, fallback: T): T {
	if (typeof window === "undefined") return fallback
	try {
		const raw = window.localStorage.getItem(key)
		if (!raw) return fallback
		return JSON.parse(raw) as T
	} catch {
		return fallback
	}
}

function saveJSON(key: string, value: unknown) {
	if (typeof window === "undefined") return
	try {
		window.localStorage.setItem(key, JSON.stringify(value))
	} catch {
		// quota / disabled storage — silently ignore
	}
}

function cardKey(personId: number, type: ChallengeType): string {
	return `${personId}:${type}`
}

function getCard(
	states: CardStates,
	personId: number,
	type: ChallengeType,
): Card {
	const key = cardKey(personId, type)
	let card = states[key]
	if (!card) {
		card = createEmptyCard()
		states[key] = card
	}
	// Dates from JSON.parse are strings; rehydrate
	if (!(card.due instanceof Date)) card.due = new Date(card.due)
	if (card.last_review && !(card.last_review instanceof Date)) {
		card.last_review = new Date(card.last_review)
	}
	return card
}

function firstNameOf(name: string): string {
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

function buildChallenge(
	people: Person[],
	states: CardStates,
	confusion: ConfusionMatrix,
	recent: number[],
): Challenge | null {
	const now = new Date()
	if (people.length < 2) return null

	type Candidate = { profile: Person; type: ChallengeType }
	const all: Candidate[] = []
	for (const p of people) {
		all.push({ profile: p, type: "face-to-name" })
		all.push({ profile: p, type: "name-to-face" })
	}

	const withGap = (cards: Candidate[]) =>
		cards.filter((c) => !recent.includes(c.profile.personId))

	const news = all.filter(
		(c) => getCard(states, c.profile.personId, c.type).state === 0,
	)
	let selected: Candidate | undefined
	if (news.length > 0) {
		const pool = withGap(news)
		const eligible = pool.length > 0 ? pool : news
		selected = eligible[Math.floor(Math.random() * eligible.length)]
	} else {
		const dues = all.filter(
			(c) => getCard(states, c.profile.personId, c.type).due <= now,
		)
		const sortByDue = (cards: Candidate[]) =>
			[...cards].sort(
				(a, b) =>
					getCard(states, a.profile.personId, a.type).due.getTime() -
					getCard(states, b.profile.personId, b.type).due.getTime(),
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
	const card = getCard(states, correct.personId, selected.type)
	const distractorsNeeded = numCandidates(card, people.length) - 1

	const distractors: Person[] = []
	const usedFirstNames = new Set([correct.firstName])

	// Priority 0: known confusions
	const personConf = confusion[String(correct.personId)] ?? {}
	const confusionOrder = Object.entries(personConf)
		.sort((a, b) => b[1] - a[1])
		.map(([id]) => people.find((p) => String(p.personId) === id))
		.filter((p): p is Person => Boolean(p))
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

function computeCounts(people: Person[], states: CardStates) {
	const now = new Date()
	let due = 0
	let fresh = 0
	for (const p of people) {
		for (const type of ["face-to-name", "name-to-face"] as const) {
			const card = getCard(states, p.personId, type)
			if (card.state === 0) fresh++
			else if (card.due <= now) due++
		}
	}
	return { due, fresh }
}

function streakProgress(streak: number): {
	prev: number
	next: number
	progress: number
	prevColor: string
	nextColor: string
	shakeIntensity: number
} {
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
		prevColor: STREAK_MILESTONES[prev]?.color ?? "#1e293b",
		nextColor: STREAK_MILESTONES[next]?.color ?? "#22d3ee",
		shakeIntensity: Math.min(Math.floor(streak / 5), 5),
	}
}

export const Route = createFileRoute("/study-faces")({
	beforeLoad: async () => {
		const { data: session } = await authClient.getSession()
		if (!session) {
			throw redirect({ to: "/login" })
		}
	},
	component: StudyFacesPage,
})

function StudyFacesPage() {
	const router = useRouter()
	const { data: session } = useSession()
	const sessionUser = session?.user as { rcId?: string } | undefined
	const userRcId = sessionUser?.rcId
		? Number.parseInt(sessionUser.rcId, 10)
		: undefined

	const [mode, setMode] = useState<Mode>("hub")

	const { data: hub, isLoading: hubLoading } = useQuery({
		...api.hubVisits.queryOptions({}),
		enabled: mode === "hub",
	})

	const directoryEnabled = mode === "batch" || mode === "all"
	const {
		data: dirData,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["studyFacesDirectory", mode],
		queryFn: ({ pageParam }) =>
			api.directorySearch.call({
				scope: mode === "batch" ? "current" : undefined,
				limit: DIRECTORY_LIMIT,
				offset: pageParam,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (allPages.length >= ALL_MAX_PAGES) return undefined
			if (lastPage.people.length < DIRECTORY_LIMIT) return undefined
			return allPages.length * DIRECTORY_LIMIT
		},
		enabled: directoryEnabled,
	})

	useEffect(() => {
		if (hasNextPage && !isFetchingNextPage) fetchNextPage()
	}, [hasNextPage, isFetchingNextPage, fetchNextPage])

	const directoryLoading =
		directoryEnabled && (!dirData || hasNextPage || isFetchingNextPage)
	const isLoading = mode === "hub" ? hubLoading || !hub : directoryLoading

	const people: Person[] = useMemo(() => {
		let raw: Person[]
		if (mode === "hub") {
			raw =
				hub?.visitors?.map((v) => ({
					personId: v.personId,
					name: v.name,
					firstName: firstNameOf(v.name),
					imageUrl: v.imageUrl,
					batch: v.batch,
					stintType: v.stintType,
					pronouns: v.pronouns,
					role: v.role,
				})) ?? []
		} else {
			const combined = dirData?.pages.flatMap((p) => p.people) ?? []
			const seen = new Set<number>()
			raw = []
			for (const p of combined) {
				if (seen.has(p.id)) continue
				seen.add(p.id)
				raw.push({
					personId: p.id,
					name: p.name,
					firstName: firstNameOf(p.name),
					imageUrl: p.imageUrl,
					batch: p.batch,
					stintType: p.stintType,
					pronouns: p.pronouns,
					role: p.role,
				})
			}
		}
		const filtered =
			userRcId !== undefined ? raw.filter((p) => p.personId !== userRcId) : raw
		return filtered.filter(
			(p) => p.imageUrl && !p.imageUrl.includes("no_photo"),
		)
	}, [mode, hub, dirData, userRcId])

	const cardsRef = useRef<CardStates>({})
	const confusionRef = useRef<ConfusionMatrix>({})
	const recentRef = useRef<number[]>([])
	const initRef = useRef(false)
	if (!initRef.current) {
		initRef.current = true
		cardsRef.current = loadJSON<CardStates>(STORAGE_CARDS, {})
		confusionRef.current = loadJSON<ConfusionMatrix>(STORAGE_CONFUSION, {})
	}

	const [streak, setStreak] = useState<number>(() => {
		if (typeof window === "undefined") return 0
		const raw = window.localStorage.getItem(STORAGE_STREAK)
		const n = raw ? Number.parseInt(raw, 10) : 0
		return Number.isFinite(n) ? n : 0
	})
	const [challenge, setChallenge] = useState<Challenge | null>(null)
	const [incorrectPicks, setIncorrectPicks] = useState<number[]>([])
	const [correctPick, setCorrectPick] = useState<number | null>(null)
	const [hasErrored, setHasErrored] = useState(false)
	const [ready, setReady] = useState(false)
	const [announcement, setAnnouncement] = useState<{
		text: string
		color: string
		key: number
	} | null>(null)
	const [counts, setCounts] = useState<{ due: number; fresh: number }>({
		due: 0,
		fresh: 0,
	})

	const startChallenge = useCallback(() => {
		if (people.length < 2) {
			setChallenge(null)
			setCounts(computeCounts(people, cardsRef.current))
			return
		}

		const active = loadJSON<ActiveChallenge | null>(STORAGE_ACTIVE, null)
		if (active) {
			const correct = people.find((p) => p.personId === active.correctId)
			const options = active.optionIds
				.map((id) => people.find((p) => p.personId === id))
				.filter((p): p is Person => Boolean(p))
			if (correct && options.length === active.optionIds.length) {
				setChallenge({ type: active.type, correct, options })
				setHasErrored(active.hasErrored)
				setIncorrectPicks([])
				setCorrectPick(null)
				setReady(false)
				setCounts(computeCounts(people, cardsRef.current))
				return
			}
		}

		const next = buildChallenge(
			people,
			cardsRef.current,
			confusionRef.current,
			recentRef.current,
		)
		if (!next) {
			setChallenge(null)
			setCounts(computeCounts(people, cardsRef.current))
			return
		}
		recentRef.current = [...recentRef.current, next.correct.personId].slice(
			-MIN_REPEAT_GAP,
		)
		saveJSON(STORAGE_ACTIVE, {
			correctId: next.correct.personId,
			type: next.type,
			optionIds: next.options.map((o) => o.personId),
			hasErrored: false,
		} satisfies ActiveChallenge)
		setChallenge(next)
		setHasErrored(false)
		setIncorrectPicks([])
		setCorrectPick(null)
		setReady(false)
		setCounts(computeCounts(people, cardsRef.current))
	}, [people])

	useEffect(() => {
		startChallenge()
	}, [startChallenge])

	useEffect(() => {
		if (!challenge) return
		const t = setTimeout(() => setReady(true), REVEAL_DELAY_MS)
		return () => clearTimeout(t)
	}, [challenge])

	const handlePick = useCallback(
		(optionIndex: number) => {
			if (!challenge || !ready) return
			if (correctPick !== null) return
			if (incorrectPicks.includes(optionIndex)) return

			const chosen = challenge.options[optionIndex]
			const isCorrect = chosen.personId === challenge.correct.personId
			const now = new Date()
			const target = challenge.correct
			const targetKey = cardKey(target.personId, challenge.type)
			const targetCard = getCard(
				cardsRef.current,
				target.personId,
				challenge.type,
			)

			if (isCorrect) {
				setCorrectPick(optionIndex)
				if (typeof window !== "undefined") {
					window.localStorage.removeItem(STORAGE_ACTIVE)
				}
				if (!hasErrored) {
					const result = fsrs.repeat(targetCard, now)
					cardsRef.current[targetKey] = result[Rating.Good].card
					saveJSON(STORAGE_CARDS, cardsRef.current)
					const nextStreak = streak + 1
					setStreak(nextStreak)
					saveJSON(STORAGE_STREAK, nextStreak)
					const milestone = STREAK_MILESTONES[nextStreak]
					if (milestone) {
						setAnnouncement({
							text: milestone.name,
							color: milestone.color,
							key: Date.now(),
						})
					} else if (nextStreak > MAX_MILESTONE && nextStreak % 5 === 0) {
						const m = STREAK_MILESTONES[MAX_MILESTONE]
						if (m) {
							setAnnouncement({
								text: m.name,
								color: m.color,
								key: Date.now(),
							})
						}
					}
				}
				setTimeout(() => startChallenge(), ADVANCE_CORRECT_MS)
				return
			}

			// Incorrect
			setIncorrectPicks((prev) => [...prev, optionIndex])
			if (streak > 0) {
				setStreak(0)
				saveJSON(STORAGE_STREAK, 0)
			}

			const targetId = String(target.personId)
			const distractorId = String(chosen.personId)
			confusionRef.current[targetId] = confusionRef.current[targetId] ?? {}
			confusionRef.current[targetId][distractorId] =
				(confusionRef.current[targetId][distractorId] ?? 0) + 1
			confusionRef.current[distractorId] =
				confusionRef.current[distractorId] ?? {}
			confusionRef.current[distractorId][targetId] =
				(confusionRef.current[distractorId][targetId] ?? 0) + 1

			if (!hasErrored) {
				const targetResult = fsrs.repeat(targetCard, now)
				cardsRef.current[targetKey] = targetResult[Rating.Again].card
				for (const dir of ["face-to-name", "name-to-face"] as const) {
					const k = cardKey(chosen.personId, dir)
					const c = getCard(cardsRef.current, chosen.personId, dir)
					const r = fsrs.repeat(c, now)
					cardsRef.current[k] = r[Rating.Again].card
				}
			}
			saveJSON(STORAGE_CARDS, cardsRef.current)
			saveJSON(STORAGE_CONFUSION, confusionRef.current)
			setHasErrored(true)
			const active = loadJSON<ActiveChallenge | null>(STORAGE_ACTIVE, null)
			if (active) {
				saveJSON(STORAGE_ACTIVE, { ...active, hasErrored: true })
			}
		},
		[
			challenge,
			ready,
			correctPick,
			incorrectPicks,
			hasErrored,
			streak,
			startChallenge,
		],
	)

	useEffect(() => {
		function handler(e: KeyboardEvent) {
			if (!challenge || !ready || correctPick !== null) return
			const n = Number.parseInt(e.key, 10)
			if (!Number.isFinite(n)) return
			if (n < 1 || n > challenge.options.length) return
			e.preventDefault()
			handlePick(n - 1)
		}
		window.addEventListener("keydown", handler)
		return () => window.removeEventListener("keydown", handler)
	}, [challenge, ready, correctPick, handlePick])

	useEffect(() => {
		if (!announcement) return
		const t = setTimeout(() => setAnnouncement(null), 1500)
		return () => clearTimeout(t)
	}, [announcement])

	const progress = streakProgress(streak)
	const noQuiz = !isLoading && people.length < 2

	function optionTextClass(i: number): string {
		const base =
			"relative flex w-full cursor-pointer items-center justify-center rounded-xl px-4 py-3.5 text-base font-medium transition-colors"
		if (correctPick === i) {
			return `${base} border border-green-500/40 bg-green-500/15 text-green-300 cursor-default`
		}
		if (incorrectPicks.includes(i)) {
			return `${base} border border-rose-500/40 bg-rose-500/15 text-rose-300 cursor-default opacity-60`
		}
		if (correctPick !== null) {
			return `${base} border border-border bg-surface-inset text-text-tertiary opacity-50 cursor-default`
		}
		return `${base} border border-border bg-surface-inset text-foreground hover:bg-surface-inset/70`
	}

	function optionImageClass(i: number): string {
		const base =
			"relative aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border bg-surface-inset transition-all"
		if (correctPick === i) {
			return `${base} border-green-500/60 ring-2 ring-green-500/40 cursor-default`
		}
		if (incorrectPicks.includes(i)) {
			return `${base} border-rose-500/60 ring-2 ring-rose-500/40 opacity-60 cursor-default`
		}
		if (correctPick !== null) {
			return `${base} border-border opacity-50 cursor-default`
		}
		return `${base} border-border hover:border-cyan/60`
	}

	return (
		<PageLayout
			className="gap-4 md:gap-5"
			title="Study faces"
			subtitle={
				<button
					type="button"
					onClick={() => router.history.back()}
					className="flex cursor-pointer items-center gap-1 text-sm text-text-tertiary hover:text-foreground"
				>
					<ChevronLeft size={14} color="#64748B" />
					Back
				</button>
			}
			headerRight={
				<Link
					to="/profile"
					className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-card"
				>
					{session?.user?.image ? (
						<img
							src={session.user.image}
							alt=""
							className="h-full w-full object-cover"
						/>
					) : (
						<User size={22} color="#22D3EE" />
					)}
				</Link>
			}
		>
			{/* Streak + counts */}
			<div className="mx-auto flex w-full max-w-sm flex-col gap-2">
				<div className="flex items-center justify-between">
					<div
						className={`flex items-baseline gap-2 ${progress.shakeIntensity > 0 ? "study-faces-shake" : ""}`}
						style={
							progress.shakeIntensity > 0
								? ({
										["--shake-intensity" as string]: `${progress.shakeIntensity}px`,
									} as React.CSSProperties)
								: undefined
						}
					>
						<span className="font-mono text-xs text-text-tertiary">streak</span>
						<span
							className="font-mono text-lg font-semibold"
							style={{ color: streak > 0 ? progress.nextColor : "#64748B" }}
						>
							{streak}
						</span>
					</div>
					<div className="flex gap-3 font-mono text-xs">
						{counts.due > 0 && (
							<span className="text-cyan">{counts.due} due</span>
						)}
						{counts.fresh > 0 && (
							<span className="text-text-tertiary">{counts.fresh} new</span>
						)}
						{counts.due === 0 && counts.fresh === 0 && people.length > 0 && (
							<span className="text-text-tertiary">caught up ✓</span>
						)}
					</div>
				</div>
				<div
					className="h-1 w-full overflow-hidden rounded-full"
					style={{
						background: streak > 0 ? progress.prevColor : "#1e293b",
					}}
				>
					<div
						className="h-full transition-all duration-200"
						style={{
							width: streak > 0 ? `${progress.progress}%` : "0%",
							background: progress.nextColor,
						}}
					/>
				</div>
			</div>

			{/* Mode selector */}
			<div className="mx-auto flex w-full max-w-sm overflow-hidden rounded-full border border-border">
				{MODE_LABELS.map((m) => (
					<button
						key={m.id}
						type="button"
						onClick={() => setMode(m.id)}
						className={`flex-1 cursor-pointer py-2 text-center text-[13px] font-semibold transition-colors ${
							mode === m.id
								? "bg-cyan/15 text-cyan"
								: "text-text-tertiary hover:text-foreground"
						}`}
					>
						{m.label}
					</button>
				))}
			</div>

			{isLoading && (
				<div className="flex flex-1 items-center justify-center">
					<span className="text-sm text-text-tertiary">Loading...</span>
				</div>
			)}

			{noQuiz && (
				<div className="flex flex-1 items-center justify-center">
					<span className="text-sm text-text-tertiary">
						Need at least 2 people with photos to study.
					</span>
				</div>
			)}

			{!isLoading && challenge && (
				<div className="mx-auto flex w-full max-w-sm flex-col gap-3">
					{/* Prompt */}
					<div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3">
						{challenge.correct.role && challenge.correct.role !== "current" && (
							<span
								className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
									challenge.correct.role === "faculty"
										? "bg-cyan/15 text-cyan"
										: "bg-surface-inset text-text-tertiary"
								}`}
							>
								{challenge.correct.role}
							</span>
						)}
						{challenge.type === "face-to-name" ? (
							<div className="h-28 w-28 overflow-hidden rounded-xl bg-surface-inset">
								{challenge.correct.imageUrl && (
									<img
										src={challenge.correct.imageUrl}
										alt=""
										className="h-full w-full object-cover"
										style={{ objectPosition: AVATAR_FACE_OBJECT_POSITION }}
									/>
								)}
							</div>
						) : (
							<div className="flex h-28 w-full items-center justify-center px-2">
								<span className="break-words text-center text-2xl font-semibold text-foreground sm:text-3xl">
									{challenge.correct.firstName}
								</span>
							</div>
						)}
						{(correctPick !== null || incorrectPicks.length > 0) && (
							<span className="text-center font-mono text-xs text-text-tertiary">
								{challenge.correct.name}
								{challenge.correct.batch || challenge.correct.stintType ? (
									<>
										{" · "}
										{getSubtitle(
											challenge.correct.batch,
											challenge.correct.stintType ?? null,
										)}
									</>
								) : null}
							</span>
						)}
					</div>

					{/* Options */}
					<div
						className={`transition-opacity duration-200 ${ready ? "opacity-100" : "pointer-events-none opacity-0"}`}
					>
						{challenge.type === "face-to-name" ? (
							<div className="flex flex-col gap-2.5">
								{challenge.options.map((opt, i) => (
									<button
										key={opt.personId}
										type="button"
										onClick={() => handlePick(i)}
										disabled={
											correctPick !== null || incorrectPicks.includes(i)
										}
										className={optionTextClass(i)}
									>
										<span className="absolute left-4 font-mono text-xs text-text-tertiary">
											{i + 1}
										</span>
										{opt.firstName}
									</button>
								))}
							</div>
						) : (
							<div
								className={`grid gap-2.5 ${challenge.options.length <= 2 ? "grid-cols-2" : challenge.options.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}
							>
								{challenge.options.map((opt, i) => (
									<button
										key={opt.personId}
										type="button"
										onClick={() => handlePick(i)}
										disabled={
											correctPick !== null || incorrectPicks.includes(i)
										}
										className={optionImageClass(i)}
									>
										{opt.imageUrl && (
											<img
												src={opt.imageUrl}
												alt=""
												className="h-full w-full object-cover"
												style={{ objectPosition: AVATAR_FACE_OBJECT_POSITION }}
											/>
										)}
										<span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded bg-background/80 font-mono text-[10px] font-semibold text-foreground">
											{i + 1}
										</span>
									</button>
								))}
							</div>
						)}
					</div>

					<span className="text-center text-xs text-text-tertiary">
						Tip: press 1–{challenge.options.length} on your keyboard
					</span>
				</div>
			)}

			{/* Credit */}
			<a
				href="https://github.com/rafd/rc-srs"
				target="_blank"
				rel="noreferrer"
				className="mt-auto text-center text-xs text-text-tertiary no-underline hover:text-foreground"
			>
				inspired by Raf's rc-srs
			</a>

			{/* Streak announcement overlay */}
			{announcement && (
				<div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-6">
					<span
						key={announcement.key}
						className="study-faces-pop max-w-[92vw] break-words text-center font-mono text-[clamp(2rem,11vw,4.5rem)] font-extrabold leading-tight tracking-tight"
						style={{
							color: announcement.color,
							textShadow: `0 0 24px ${announcement.color}80, 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000`,
						}}
					>
						{announcement.text}
					</span>
				</div>
			)}
		</PageLayout>
	)
}
