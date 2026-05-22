import type { Client } from "@batchmate/api-client"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
	Animated,
	Easing,
	Image,
	Platform,
	Pressable,
	View,
} from "react-native"
import { getSubtitle } from "../../lib/stint-labels"
import {
	STUDY_FACES_ADVANCE_CORRECT_MS,
	STUDY_FACES_ANNOUNCEMENT_MS,
	STUDY_FACES_MIN_REPEAT_GAP,
	STUDY_FACES_MODE_LABELS,
	STUDY_FACES_REVEAL_DELAY_MS,
	STUDY_FACES_STORAGE_KEYS,
	type StudyFacesActiveChallenge,
	type StudyFacesCardStates,
	type StudyFacesChallenge,
	type StudyFacesConfusionMatrix,
	type StudyFacesMode,
	type StudyFacesPerson,
	studyFacesBuildChallenge,
	studyFacesComputeCounts,
	studyFacesFirstName,
	studyFacesPickMilestone,
	studyFacesRecordConfusion,
	studyFacesScheduleCorrect,
	studyFacesScheduleIncorrect,
	studyFacesStreakProgress,
} from "../../lib/study-faces"
import { ExternalLink } from "./external-link"
import { Text } from "./text"

export type StudyFacesStorage = {
	read<T>(key: string, fallback: T): T
	write(key: string, value: unknown): void
	remove(key: string): void
}

export type StudyFacesGameProps = {
	api: Client
	userRcId: number | undefined
	storage: StudyFacesStorage
}

const DIRECTORY_LIMIT = 50
const ALL_MAX_PAGES = 4

const PROMPT_FACE_SIZE = 112

function useShake(intensity: number) {
	const value = useRef(new Animated.Value(0)).current
	useEffect(() => {
		if (intensity <= 0) {
			value.stopAnimation()
			value.setValue(0)
			return
		}
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(value, {
					toValue: 1,
					duration: 60,
					easing: Easing.linear,
					useNativeDriver: true,
				}),
				Animated.timing(value, {
					toValue: -1,
					duration: 60,
					easing: Easing.linear,
					useNativeDriver: true,
				}),
				Animated.timing(value, {
					toValue: 0,
					duration: 60,
					easing: Easing.linear,
					useNativeDriver: true,
				}),
			]),
		)
		loop.start()
		return () => loop.stop()
	}, [intensity, value])
	return {
		transform: [
			{
				translateX: value.interpolate({
					inputRange: [-1, 1],
					outputRange: [-intensity, intensity],
				}),
			},
		],
	}
}

function AnnouncementOverlay({ text, color }: { text: string; color: string }) {
	const scale = useRef(new Animated.Value(0.6)).current
	const opacity = useRef(new Animated.Value(0)).current
	useEffect(() => {
		scale.setValue(0.6)
		opacity.setValue(0)
		Animated.parallel([
			Animated.sequence([
				Animated.timing(scale, {
					toValue: 1.05,
					duration: 450,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: true,
				}),
				Animated.timing(scale, {
					toValue: 1,
					duration: 600,
					useNativeDriver: true,
				}),
			]),
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
				}),
				Animated.delay(900),
				Animated.timing(opacity, {
					toValue: 0,
					duration: 400,
					useNativeDriver: true,
				}),
			]),
		]).start()
	}, [scale, opacity])
	return (
		<View
			pointerEvents="none"
			className="absolute inset-0 z-50 items-center justify-center px-6"
		>
			<Animated.Text
				style={{
					color,
					fontFamily: "CommitMono",
					fontSize: 56,
					fontWeight: "800",
					textAlign: "center",
					textShadowColor: color,
					textShadowRadius: 16,
					transform: [{ scale }],
					opacity,
				}}
			>
				{text}
			</Animated.Text>
		</View>
	)
}

function FaceImage({ uri, radius }: { uri: string | null; radius: number }) {
	if (!uri) {
		return (
			<View
				style={{ borderRadius: radius }}
				className="h-full w-full bg-surface-inset"
			/>
		)
	}
	return (
		<View
			style={{ borderRadius: radius, overflow: "hidden" }}
			className="h-full w-full bg-surface-inset"
		>
			<Image
				source={{ uri }}
				resizeMode="cover"
				style={{ width: "100%", height: "120%", marginTop: "-10%" }}
			/>
		</View>
	)
}

export function StudyFacesGame({
	api,
	userRcId,
	storage,
}: StudyFacesGameProps) {
	const [mode, setMode] = useState<StudyFacesMode>("hub")

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

	const people: StudyFacesPerson[] = useMemo(() => {
		let raw: StudyFacesPerson[]
		if (mode === "hub") {
			raw =
				hub?.visitors?.map((v) => ({
					personId: v.personId,
					name: v.name,
					firstName: studyFacesFirstName(v.name),
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
					firstName: studyFacesFirstName(p.name),
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
	const cardsRef = useRef<StudyFacesCardStates>({})
	const confusionRef = useRef<StudyFacesConfusionMatrix>({})
	const recentRef = useRef<number[]>([])
	const hydratedRef = useRef(false)
	if (!hydratedRef.current) {
		hydratedRef.current = true
		cardsRef.current = storage.read<StudyFacesCardStates>(
			STUDY_FACES_STORAGE_KEYS.cards,
			{},
		)
		confusionRef.current = storage.read<StudyFacesConfusionMatrix>(
			STUDY_FACES_STORAGE_KEYS.confusion,
			{},
		)
	}

	const [streak, setStreak] = useState<number>(() => {
		const raw = storage.read<number>(STUDY_FACES_STORAGE_KEYS.streak, 0)
		return Number.isFinite(raw) ? raw : 0
	})
	const [challenge, setChallenge] = useState<StudyFacesChallenge | null>(null)
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
			setCounts(studyFacesComputeCounts(people, cardsRef.current))
			return
		}

		const active = storage.read<StudyFacesActiveChallenge | null>(
			STUDY_FACES_STORAGE_KEYS.active,
			null,
		)
		if (active) {
			const correct = people.find((p) => p.personId === active.correctId)
			const options = active.optionIds
				.map((id) => people.find((p) => p.personId === id))
				.filter((p): p is StudyFacesPerson => Boolean(p))
			if (correct && options.length === active.optionIds.length) {
				setChallenge({ type: active.type, correct, options })
				setHasErrored(active.hasErrored)
				setIncorrectPicks([])
				setCorrectPick(null)
				setReady(false)
				setCounts(studyFacesComputeCounts(people, cardsRef.current))
				return
			}
		}

		const next = studyFacesBuildChallenge(
			people,
			cardsRef.current,
			confusionRef.current,
			recentRef.current,
		)
		if (!next) {
			setChallenge(null)
			setCounts(studyFacesComputeCounts(people, cardsRef.current))
			return
		}
		recentRef.current = [...recentRef.current, next.correct.personId].slice(
			-STUDY_FACES_MIN_REPEAT_GAP,
		)
		storage.write(STUDY_FACES_STORAGE_KEYS.active, {
			correctId: next.correct.personId,
			type: next.type,
			optionIds: next.options.map((o) => o.personId),
			hasErrored: false,
		} satisfies StudyFacesActiveChallenge)
		setChallenge(next)
		setHasErrored(false)
		setIncorrectPicks([])
		setCorrectPick(null)
		setReady(false)
		setCounts(studyFacesComputeCounts(people, cardsRef.current))
	}, [people, storage])

	useEffect(() => {
		startChallenge()
	}, [startChallenge])

	useEffect(() => {
		if (!challenge) return
		const t = setTimeout(() => setReady(true), STUDY_FACES_REVEAL_DELAY_MS)
		return () => clearTimeout(t)
	}, [challenge])

	useEffect(() => {
		if (!announcement) return
		const t = setTimeout(
			() => setAnnouncement(null),
			STUDY_FACES_ANNOUNCEMENT_MS,
		)
		return () => clearTimeout(t)
	}, [announcement])

	const handlePick = useCallback(
		(optionIndex: number) => {
			if (!challenge || !ready) return
			if (correctPick !== null) return
			if (incorrectPicks.includes(optionIndex)) return

			const chosen = challenge.options[optionIndex]
			const isCorrect = chosen.personId === challenge.correct.personId
			const now = new Date()
			const target = challenge.correct

			if (isCorrect) {
				setCorrectPick(optionIndex)
				storage.remove(STUDY_FACES_STORAGE_KEYS.active)
				if (!hasErrored) {
					studyFacesScheduleCorrect(
						cardsRef.current,
						target.personId,
						challenge.type,
						now,
					)
					storage.write(STUDY_FACES_STORAGE_KEYS.cards, cardsRef.current)
					const nextStreak = streak + 1
					setStreak(nextStreak)
					storage.write(STUDY_FACES_STORAGE_KEYS.streak, nextStreak)
					const milestone = studyFacesPickMilestone(nextStreak)
					if (milestone) {
						setAnnouncement({
							text: milestone.name,
							color: milestone.color,
							key: Date.now(),
						})
					}
				}
				setTimeout(() => startChallenge(), STUDY_FACES_ADVANCE_CORRECT_MS)
				return
			}

			setIncorrectPicks((prev) => [...prev, optionIndex])
			if (streak > 0) {
				setStreak(0)
				storage.write(STUDY_FACES_STORAGE_KEYS.streak, 0)
			}

			studyFacesRecordConfusion(
				confusionRef.current,
				target.personId,
				chosen.personId,
			)

			if (!hasErrored) {
				studyFacesScheduleIncorrect(
					cardsRef.current,
					target.personId,
					challenge.type,
					chosen.personId,
					now,
				)
			}
			storage.write(STUDY_FACES_STORAGE_KEYS.cards, cardsRef.current)
			storage.write(STUDY_FACES_STORAGE_KEYS.confusion, confusionRef.current)
			setHasErrored(true)
			const active = storage.read<StudyFacesActiveChallenge | null>(
				STUDY_FACES_STORAGE_KEYS.active,
				null,
			)
			if (active) {
				storage.write(STUDY_FACES_STORAGE_KEYS.active, {
					...active,
					hasErrored: true,
				})
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
			storage,
		],
	)

	useEffect(() => {
		if (Platform.OS !== "web") return
		if (typeof window === "undefined") return
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

	const progress = useMemo(() => studyFacesStreakProgress(streak), [streak])
	const shakeStyle = useShake(progress.shakeIntensity)
	const noQuiz = !isLoading && people.length < 2
	const isWeb = Platform.OS === "web"

	function textOptionClasses(i: number): {
		container: string
		label: string
	} {
		if (correctPick === i) {
			return {
				container: "border border-green-500/40 bg-green-500/15",
				label: "text-green-300",
			}
		}
		if (incorrectPicks.includes(i)) {
			return {
				container: "border border-rose-500/40 bg-rose-500/15 opacity-60",
				label: "text-rose-300",
			}
		}
		if (correctPick !== null) {
			return {
				container: "border border-border bg-surface-inset opacity-50",
				label: "text-text-tertiary",
			}
		}
		return {
			container: "border border-border bg-surface-inset",
			label: "text-foreground",
		}
	}

	function imageOptionClasses(i: number): string {
		const base =
			"aspect-square w-full overflow-hidden rounded-2xl border bg-surface-inset"
		if (correctPick === i) return `${base} border-green-500/60`
		if (incorrectPicks.includes(i))
			return `${base} border-rose-500/60 opacity-60`
		if (correctPick !== null) return `${base} border-border opacity-50`
		return `${base} border-border`
	}

	return (
		<View className="flex-1">
			<View className="w-full max-w-sm flex-1 gap-4 self-center">
				{/* Streak + counts */}
				<View className="gap-2">
					<View className="flex-row items-center justify-between">
						<Animated.View
							style={progress.shakeIntensity > 0 ? shakeStyle : undefined}
							className="flex-row items-baseline gap-2"
						>
							<Text className="font-mono text-xs text-text-tertiary">
								streak
							</Text>
							<Text
								className="font-mono text-lg font-semibold"
								style={{
									color: streak > 0 ? progress.nextColor : "#64748B",
								}}
							>
								{streak}
							</Text>
						</Animated.View>
						<View className="flex-row gap-3">
							{counts.due > 0 && (
								<Text className="font-mono text-xs text-primary">
									{counts.due} due
								</Text>
							)}
							{counts.fresh > 0 && (
								<Text className="font-mono text-xs text-text-tertiary">
									{counts.fresh} new
								</Text>
							)}
							{counts.due === 0 && counts.fresh === 0 && people.length > 0 && (
								<Text className="font-mono text-xs text-text-tertiary">
									caught up ✓
								</Text>
							)}
						</View>
					</View>
					<View
						className="h-1 w-full overflow-hidden rounded-full"
						style={{
							backgroundColor: streak > 0 ? progress.prevColor : "#1e293b",
						}}
					>
						<View
							className="h-full"
							style={{
								width: streak > 0 ? `${progress.progress}%` : "0%",
								backgroundColor: progress.nextColor,
							}}
						/>
					</View>
				</View>

				{/* Mode selector */}
				<View className="flex-row overflow-hidden rounded-full border border-border">
					{STUDY_FACES_MODE_LABELS.map((m) => (
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

				{noQuiz && (
					<View className="items-center py-20">
						<Text className="text-center text-sm text-text-tertiary">
							Need at least 2 people with photos to study.
						</Text>
					</View>
				)}

				{!isLoading && challenge && (
					<View className="gap-3">
						{/* Prompt */}
						<View className="items-center gap-2 rounded-2xl bg-card p-3">
							{challenge.correct.role &&
								challenge.correct.role !== "current" && (
									<View
										className={`rounded-full px-2 py-0.5 ${
											challenge.correct.role === "faculty"
												? "bg-cyan/15"
												: "bg-surface-inset"
										}`}
									>
										<Text
											className={`text-[10px] font-semibold uppercase ${
												challenge.correct.role === "faculty"
													? "text-primary"
													: "text-text-tertiary"
											}`}
											style={{ letterSpacing: 1.2 }}
										>
											{challenge.correct.role}
										</Text>
									</View>
								)}
							{challenge.type === "face-to-name" ? (
								<View
									style={{
										width: PROMPT_FACE_SIZE,
										height: PROMPT_FACE_SIZE,
									}}
									className="overflow-hidden rounded-xl bg-surface-inset"
								>
									<FaceImage uri={challenge.correct.imageUrl} radius={12} />
								</View>
							) : (
								<View
									style={{ height: PROMPT_FACE_SIZE }}
									className="w-full items-center justify-center px-2"
								>
									<Text
										className="text-center text-3xl font-semibold text-foreground"
										numberOfLines={2}
									>
										{challenge.correct.firstName}
									</Text>
								</View>
							)}
							{(correctPick !== null || incorrectPicks.length > 0) && (
								<Text className="text-center font-mono text-xs text-text-tertiary">
									{challenge.correct.name}
									{challenge.correct.batch || challenge.correct.stintType
										? ` · ${getSubtitle(
												challenge.correct.batch,
												challenge.correct.stintType ?? null,
											)}`
										: ""}
								</Text>
							)}
						</View>

						{/* Options */}
						<View
							style={{ opacity: ready ? 1 : 0 }}
							pointerEvents={ready ? "auto" : "none"}
						>
							{challenge.type === "face-to-name" ? (
								<View className="gap-2.5">
									{challenge.options.map((opt, i) => {
										const cls = textOptionClasses(i)
										return (
											<Pressable
												key={opt.personId}
												onPress={() => handlePick(i)}
												disabled={
													correctPick !== null || incorrectPicks.includes(i)
												}
												className={`rounded-xl px-4 py-3.5 ${cls.container}`}
											>
												<View className="absolute bottom-0 left-4 top-0 justify-center">
													<Text className="font-mono text-xs text-text-tertiary">
														{i + 1}
													</Text>
												</View>
												<Text
													className={`text-center text-base font-medium ${cls.label}`}
												>
													{opt.firstName}
												</Text>
											</Pressable>
										)
									})}
								</View>
							) : (
								<View className="-mx-1 flex-row flex-wrap">
									{challenge.options.map((opt, i) => {
										const cols = challenge.options.length <= 4 ? 2 : 3
										const widthClass = cols === 2 ? "w-1/2" : "w-1/3"
										return (
											<View
												key={opt.personId}
												className={`${widthClass} px-1 pb-2`}
											>
												<Pressable
													onPress={() => handlePick(i)}
													disabled={
														correctPick !== null || incorrectPicks.includes(i)
													}
													className={imageOptionClasses(i)}
												>
													<FaceImage uri={opt.imageUrl} radius={16} />
													<View className="absolute left-1.5 top-1.5 h-5 w-5 items-center justify-center rounded bg-background/80">
														<Text className="font-mono text-[10px] font-semibold text-foreground">
															{i + 1}
														</Text>
													</View>
												</Pressable>
											</View>
										)
									})}
								</View>
							)}
						</View>

						{isWeb && (
							<Text className="text-center text-xs text-text-tertiary">
								Tip: press 1–{challenge.options.length} on your keyboard
							</Text>
						)}
					</View>
				)}

				{/* Credit */}
				<ExternalLink href="https://github.com/rafd/rc-srs">
					<Text className="text-center text-xs text-text-tertiary">
						inspired by Raf's rc-srs
					</Text>
				</ExternalLink>
			</View>

			{announcement && (
				<AnnouncementOverlay
					key={announcement.key}
					text={announcement.text}
					color={announcement.color}
				/>
			)}
		</View>
	)
}
