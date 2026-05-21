import { getSubtitle, Text } from "@batchmate/ui"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import { ChevronLeft, RotateCcw, Sparkles } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { Pressable, ScrollView, View } from "react-native"
import { Avatar } from "../../src/components/avatar"
import { api } from "../../src/lib/api"
import { useSession } from "../../src/lib/auth"

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

export default function StudyFacesScreen() {
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

	function optionStyle(optionIndex: number): string {
		if (picked === null) return "border border-border bg-surface-inset"
		const isCorrect = card && optionIndex === card.correctIndex
		const isPicked = optionIndex === picked
		if (isCorrect) return "border border-green-500/40 bg-green-500/15"
		if (isPicked) return "border border-rose-500/40 bg-rose-500/15"
		return "border border-border bg-surface-inset opacity-50"
	}

	function optionTextStyle(optionIndex: number): string {
		if (picked === null) return "text-foreground"
		const isCorrect = card && optionIndex === card.correctIndex
		const isPicked = optionIndex === picked
		if (isCorrect) return "text-green-300"
		if (isPicked) return "text-rose-300"
		return "text-text-tertiary"
	}

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="px-6 py-4 gap-6"
		>
			<View className="flex-row items-center justify-between">
				<Pressable
					className="flex-row items-center gap-1.5"
					onPress={() => router.back()}
				>
					<ChevronLeft size={20} color="#94A3B8" />
					<Text className="text-sm font-medium text-text-secondary">Back</Text>
				</Pressable>
				<View className="flex-row items-center gap-1.5">
					<Sparkles size={14} color="#22D3EE" />
					<Text className="text-[15px] font-semibold">Study faces</Text>
				</View>
				<View className="w-12" />
			</View>

			{/* Mode selector */}
			<View className="flex-row overflow-hidden rounded-full border border-border">
				{MODE_LABELS.map((m) => (
					<Pressable
						key={m.id}
						onPress={() => setMode(m.id)}
						className={`flex-1 py-2 ${mode === m.id ? "bg-cyan/15" : ""}`}
					>
						<Text
							className={`text-center text-[13px] font-semibold ${
								mode === m.id ? "text-primary" : "text-text-tertiary"
							}`}
						>
							{m.label}
						</Text>
					</Pressable>
				))}
			</View>

			{isLoading && (
				<View className="items-center py-20">
					<Text className="text-sm text-text-tertiary">Loading...</Text>
				</View>
			)}

			{!isLoading && deck.length === 0 && (
				<View className="items-center gap-3 py-20">
					<Text className="text-base text-text-tertiary">
						Need at least {OPTION_COUNT} people to study.
					</Text>
				</View>
			)}

			{!isLoading && deck.length > 0 && !done && card && (
				<View className="gap-6">
					<View className="flex-row items-center justify-between">
						<Text className="font-mono text-xs text-text-tertiary">
							{index + 1} / {deck.length}
						</Text>
						<View className="flex-row gap-3">
							<Text className="font-mono text-xs text-green-400">
								✓ {correct}
							</Text>
							<Text className="font-mono text-xs text-rose-400">✗ {wrong}</Text>
						</View>
					</View>

					<View className="items-center gap-4 rounded-3xl bg-card p-6">
						<Avatar
							imageUrl={card.person.imageUrl}
							name={card.person.name}
							size="xl"
						/>
						{picked !== null && (
							<Text className="text-center font-mono text-xs text-text-tertiary">
								{getSubtitle(card.person.batch, card.person.stintType ?? null)}
							</Text>
						)}
					</View>

					<View className="gap-2.5">
						{card.options.map((option, i) => (
							<Pressable
								key={option}
								onPress={() => pick(i)}
								disabled={picked !== null}
								className={`rounded-xl px-4 py-3.5 ${optionStyle(i)}`}
							>
								<Text
									className={`text-center text-base font-medium ${optionTextStyle(i)}`}
								>
									{option}
								</Text>
							</Pressable>
						))}
					</View>

					{picked !== null && (
						<Pressable
							onPress={advance}
							className="items-center rounded-xl bg-cyan py-3.5"
						>
							<Text className="text-[15px] font-semibold text-background">
								{index + 1 < deck.length ? "Next" : "See results"}
							</Text>
						</Pressable>
					)}
				</View>
			)}

			{done && (
				<View className="items-center gap-4 rounded-3xl bg-card p-8">
					<Sparkles size={36} color="#22D3EE" />
					<View className="items-center gap-1.5">
						<Text className="text-xl font-semibold">Done!</Text>
						<Text className="text-sm text-text-tertiary">
							You got {correct} of {deck.length}
						</Text>
					</View>
					<Pressable
						onPress={() => setSeed((s) => s + 1)}
						className="flex-row items-center gap-2 rounded-xl bg-cyan px-5 py-3"
					>
						<RotateCcw size={16} color="#0A0F1C" />
						<Text className="text-sm font-semibold text-background">
							Study again
						</Text>
					</Pressable>
				</View>
			)}
		</ScrollView>
	)
}
