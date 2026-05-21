import { getSubtitle } from "@batchmate/ui"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"
import { ChevronLeft, RotateCcw, Sparkles } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Avatar } from "@/components/avatar"
import { PageLayout } from "@/components/page-layout"
import { api } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth"

const OPTION_COUNT = 4
const DIRECTORY_LIMIT = 50
const ALL_SAMPLE_SIZE = 50

type Mode = "hub" | "batch" | "all"

const MODE_LABELS: { id: Mode; label: string }[] = [
	{ id: "hub", label: "In hub" },
	{ id: "batch", label: "In batch" },
	{ id: "all", label: "All" },
]

function shuffle<T>(arr: T[]): T[] {
	const out = [...arr]
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[out[i], out[j]] = [out[j], out[i]]
	}
	return out
}

type Person = {
	personId: number
	name: string
	imageUrl: string | null
	batch: string | null
	stintType: string | null
}

type Card = {
	person: Person
	options: string[]
	correctIndex: number
}

// `_seed` is unused but threads a render-time value into the deck builder so
// callers can re-shuffle by bumping a counter, instead of suppressing the
// React hook dependency lint.
function buildDeck(people: Person[], _seed: number): Card[] {
	const namePool = Array.from(new Set(people.map((p) => p.name)))
	return shuffle(people).map((person) => {
		const distractors = shuffle(
			namePool.filter((n) => n !== person.name),
		).slice(0, OPTION_COUNT - 1)
		const options = shuffle([person.name, ...distractors])
		return {
			person,
			options,
			correctIndex: options.indexOf(person.name),
		}
	})
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
	const [seed, setSeed] = useState(0)

	const { data: hub, isLoading: hubLoading } = useQuery({
		...api.hubVisits.queryOptions({}),
		enabled: mode === "hub",
	})

	const directoryEnabled = mode === "batch" || mode === "all"
	const maxPages = 2

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
			if (allPages.length >= maxPages) return undefined
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
					imageUrl: v.imageUrl,
					batch: v.batch,
					stintType: v.stintType,
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
					imageUrl: p.imageUrl,
					batch: p.batch,
					stintType: p.stintType,
				})
			}
		}
		return userRcId !== undefined
			? raw.filter((p) => p.personId !== userRcId)
			: raw
	}, [mode, hub, dirData, userRcId])

	const deck = useMemo(() => {
		if (people.length < OPTION_COUNT) return []
		const built = buildDeck(people, seed)
		return mode === "all" ? built.slice(0, ALL_SAMPLE_SIZE) : built
	}, [people, mode, seed])

	const [index, setIndex] = useState(0)
	const [picked, setPicked] = useState<number | null>(null)
	const [correct, setCorrect] = useState(0)
	const [wrong, setWrong] = useState(0)
	// React-endorsed pattern for resetting state when a derived value changes:
	// https://react.dev/reference/react/useState#storing-information-from-previous-renders
	const [prevDeck, setPrevDeck] = useState(deck)
	if (prevDeck !== deck) {
		setPrevDeck(deck)
		setIndex(0)
		setPicked(null)
		setCorrect(0)
		setWrong(0)
	}

	const card = deck[index]
	const done = deck.length > 0 && index >= deck.length

	function pick(optionIndex: number) {
		if (picked !== null || !card) return
		setPicked(optionIndex)
		if (optionIndex === card.correctIndex) setCorrect((n) => n + 1)
		else setWrong((n) => n + 1)
	}

	function advance() {
		setPicked(null)
		setIndex((i) => i + 1)
	}

	useEffect(() => {
		function handler(e: KeyboardEvent) {
			if (!card || done) return
			if (picked === null) {
				const n = Number.parseInt(e.key, 10)
				if (n >= 1 && n <= OPTION_COUNT) {
					e.preventDefault()
					pick(n - 1)
				}
				return
			}
			if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
				e.preventDefault()
				advance()
			}
		}
		document.addEventListener("keydown", handler)
		return () => document.removeEventListener("keydown", handler)
	})

	function optionClass(optionIndex: number): string {
		const base =
			"flex w-full cursor-pointer items-center justify-center rounded-xl px-4 py-3.5 text-base font-medium transition-colors"
		if (picked === null) {
			return `${base} border border-border bg-surface-inset text-foreground hover:bg-surface-inset/70`
		}
		const isCorrect = card && optionIndex === card.correctIndex
		const isPicked = optionIndex === picked
		if (isCorrect) {
			return `${base} border border-green-500/40 bg-green-500/15 text-green-300 cursor-default`
		}
		if (isPicked) {
			return `${base} border border-rose-500/40 bg-rose-500/15 text-rose-300 cursor-default`
		}
		return `${base} border border-border bg-surface-inset text-text-tertiary opacity-50 cursor-default`
	}

	return (
		<PageLayout
			className="gap-6"
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
		>
			{/* Mode selector */}
			<div className="mx-auto flex w-full max-w-md overflow-hidden rounded-full border border-border">
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

			{!isLoading && deck.length === 0 && (
				<div className="flex flex-1 items-center justify-center">
					<span className="text-sm text-text-tertiary">
						Need at least {OPTION_COUNT} people to study.
					</span>
				</div>
			)}

			{!isLoading && deck.length > 0 && !done && card && (
				<div className="mx-auto flex w-full max-w-md flex-col gap-6">
					<div className="flex items-center justify-between">
						<span className="font-mono text-xs text-text-tertiary">
							{index + 1} / {deck.length}
						</span>
						<div className="flex gap-3">
							<span className="font-mono text-xs text-green-400">
								✓ {correct}
							</span>
							<span className="font-mono text-xs text-rose-400">✗ {wrong}</span>
						</div>
					</div>

					<div className="flex flex-col items-center gap-4 rounded-3xl bg-card p-6">
						<Avatar
							imageUrl={card.person.imageUrl}
							name={card.person.name}
							size="xl"
						/>
						{picked !== null && (
							<span className="text-center font-mono text-xs text-text-tertiary">
								{getSubtitle(card.person.batch, card.person.stintType ?? null)}
							</span>
						)}
					</div>

					<div className="flex flex-col gap-2.5">
						{card.options.map((option, i) => (
							<button
								key={option}
								type="button"
								onClick={() => pick(i)}
								disabled={picked !== null}
								className={optionClass(i)}
							>
								{option}
							</button>
						))}
					</div>

					{picked !== null && (
						<button
							type="button"
							onClick={advance}
							className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-cyan py-3.5 text-[15px] font-semibold text-background"
						>
							{index + 1 < deck.length ? "Next" : "See results"}
						</button>
					)}
				</div>
			)}

			{done && (
				<div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-3xl bg-card p-8">
					<Sparkles size={36} color="#22D3EE" />
					<div className="flex flex-col items-center gap-1.5">
						<span className="text-xl font-semibold text-foreground">Done!</span>
						<span className="text-sm text-text-tertiary">
							You got {correct} of {deck.length}
						</span>
					</div>
					<button
						type="button"
						onClick={() => setSeed((s) => s + 1)}
						className="flex cursor-pointer items-center gap-2 rounded-xl bg-cyan px-5 py-3 text-background"
					>
						<RotateCcw size={16} />
						<span className="text-sm font-semibold">Study again</span>
					</button>
				</div>
			)}
		</PageLayout>
	)
}
