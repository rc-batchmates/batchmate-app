import * as Haptics from "expo-haptics"
import {
	Building2,
	createLucideIcon,
	DoorOpen,
	Info,
} from "lucide-react-native"
import { useCallback, useEffect, useRef, useState } from "react"
import { Animated, Platform, Pressable, View } from "react-native"
import { Text } from "./text"

const StairsIcon = createLucideIcon("Stairs", [
	["path", { d: "M3 21h6v-6h6v-6h6V3" }],
])

const ElevatorIcon = createLucideIcon("Elevator", [
	["rect", { x: "5", y: "3", width: "14", height: "18", rx: "1" }],
	["path", { d: "M9 9l3-3 3 3" }],
	["path", { d: "M9 15l3 3 3-3" }],
])

type Floor = "4" | "5"

export type DoorAction =
	| { entry: "stairs"; floor: Floor }
	| { entry: "elevator"; floor: "all" }
	| { entry: "intercom" }

export interface DoorControlsProps {
	onOpenDoor: (action: DoorAction) => void
	isPending?: boolean
	pendingAction?: DoorAction | null
	justUnlockedAction?: DoorAction | null
	unlockDurationMs?: number
	holdDurationMs?: number
	onUnlockEnd?: () => void
}

function isSameAction(a: DoorAction, b: DoorAction | null | undefined) {
	if (!b || a.entry !== b.entry) return false
	if (a.entry === "intercom") return true
	return a.floor === (b as Extract<DoorAction, { floor: unknown }>).floor
}

const webHoldGuards =
	Platform.OS === "web"
		? ({
				onContextMenu: (e: { preventDefault: () => void }) =>
					e.preventDefault(),
				draggable: false,
			} as Record<string, unknown>)
		: {}

const webHoldStyle =
	Platform.OS === "web"
		? ({
				WebkitTouchCallout: "none",
				WebkitTapHighlightColor: "transparent",
			} as Record<string, unknown>)
		: undefined

function hapticLight() {
	if (Platform.OS === "web") {
		try {
			navigator.vibrate?.(15)
		} catch {}
	} else {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
	}
}

function hapticSuccess() {
	if (Platform.OS === "web") {
		try {
			navigator.vibrate?.([15, 30, 30])
		} catch {}
	} else {
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
			() => {},
		)
	}
}

type Phase = "idle" | "holding" | "unlocked"

function ProgressBar({
	phase,
	holdDurationMs,
	unlockDurationMs,
}: {
	phase: Phase
	holdDurationMs: number
	unlockDurationMs: number
}) {
	const widthAnim = useRef(new Animated.Value(0)).current

	useEffect(() => {
		widthAnim.stopAnimation()
		if (phase === "holding") {
			widthAnim.setValue(0)
			Animated.timing(widthAnim, {
				toValue: 1,
				duration: holdDurationMs,
				useNativeDriver: false,
			}).start()
		} else if (phase === "unlocked") {
			widthAnim.setValue(1)
			Animated.timing(widthAnim, {
				toValue: 0,
				duration: unlockDurationMs,
				useNativeDriver: false,
			}).start()
		} else {
			Animated.timing(widthAnim, {
				toValue: 0,
				duration: 150,
				useNativeDriver: false,
			}).start()
		}
	}, [phase, holdDurationMs, unlockDurationMs, widthAnim])

	const width = widthAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ["0%", "100%"],
	})

	return (
		<View
			pointerEvents="none"
			className="absolute right-0 bottom-0 left-0 h-1 overflow-hidden rounded-b-xl bg-surface-inset"
		>
			<Animated.View style={{ width, height: "100%" }} className="bg-primary" />
		</View>
	)
}

function useHoldGesture({
	holdDurationMs,
	disabled,
	onCommit,
}: {
	holdDurationMs: number
	disabled: boolean
	onCommit: () => void
}) {
	const [isHolding, setIsHolding] = useState(false)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const cancel = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
		setIsHolding(false)
	}, [])

	const onPressIn = useCallback(() => {
		if (disabled) return
		hapticLight()
		setIsHolding(true)
		timerRef.current = setTimeout(() => {
			timerRef.current = null
			setIsHolding(false)
			hapticSuccess()
			onCommit()
		}, holdDurationMs)
	}, [disabled, holdDurationMs, onCommit])

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		},
		[],
	)

	return { isHolding, onPressIn, onPressOut: cancel }
}

function IntercomCard({
	onCommit,
	isPending,
	isThis,
	isUnlocked,
	unlockDurationMs,
	holdDurationMs,
}: {
	onCommit: () => void
	isPending?: boolean
	isThis: boolean
	isUnlocked: boolean
	unlockDurationMs: number
	holdDurationMs: number
}) {
	const { isHolding, onPressIn, onPressOut } = useHoldGesture({
		holdDurationMs,
		disabled: !!isPending,
		onCommit,
	})

	const label =
		isThis && isPending
			? "Buzzing..."
			: isHolding
				? "Hold..."
				: isUnlocked
					? "Buzzed in"
					: "Building entrance"

	const phase: Phase = isHolding ? "holding" : isUnlocked ? "unlocked" : "idle"

	return (
		<Pressable
			className="flex-row items-start gap-4 overflow-hidden rounded-xl bg-card p-5 select-none"
			style={{ ...webHoldStyle }}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			disabled={isPending}
			{...webHoldGuards}
		>
			<View className="h-12 w-12 items-center justify-center rounded-[12px] bg-surface-inset">
				<Building2 size={24} color="#22D3EE" />
			</View>
			<View className="flex-1 gap-1.5">
				<Text className="text-base font-semibold">{label}</Text>
				<View className="gap-0.5">
					<Text className="text-xs text-text-secondary">
						1. Call “Recurse Center – 4th floor” on the intercom
					</Text>
					<Text className="text-xs text-text-secondary">
						3. Press and hold this button
					</Text>
				</View>
			</View>
			<ProgressBar
				phase={phase}
				holdDurationMs={holdDurationMs}
				unlockDurationMs={unlockDurationMs}
			/>
		</Pressable>
	)
}

function ElevatorCard({
	onCommit,
	isPending,
	isThis,
	isUnlocked,
	unlockDurationMs,
	holdDurationMs,
}: {
	onCommit: () => void
	isPending?: boolean
	isThis: boolean
	isUnlocked: boolean
	unlockDurationMs: number
	holdDurationMs: number
}) {
	const { isHolding, onPressIn, onPressOut } = useHoldGesture({
		holdDurationMs,
		disabled: !!isPending,
		onCommit,
	})

	const label =
		isThis && isPending
			? "Opening..."
			: isHolding
				? "Hold..."
				: isUnlocked
					? "Unlocked"
					: "Elevator"

	const phase: Phase = isHolding ? "holding" : isUnlocked ? "unlocked" : "idle"

	return (
		<Pressable
			className="flex-1 justify-between gap-4 overflow-hidden rounded-xl border border-primary/30 bg-primary/10 p-5 select-none"
			style={{ ...webHoldStyle }}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			disabled={isPending}
			{...webHoldGuards}
		>
			<View className="gap-3">
				<View className="h-12 w-12 items-center justify-center rounded-[12px] bg-surface-inset">
					<ElevatorIcon size={24} color="#22D3EE" />
				</View>
				<View className="gap-0.5">
					<Text className="text-base font-semibold">{label}</Text>
					<Text className="text-xs text-text-tertiary">
						Hold to unlock both floors
					</Text>
				</View>
			</View>
			<View className="flex-row items-start gap-2 rounded-lg bg-surface-inset/60 px-3 py-2">
				<View className="pt-px">
					<Info size={14} color="#94a3b8" />
				</View>
				<Text className="flex-1 text-xs text-text-secondary">
					After unlocking, press your floor button inside the elevator
				</Text>
			</View>
			<ProgressBar
				phase={phase}
				holdDurationMs={holdDurationMs}
				unlockDurationMs={unlockDurationMs}
			/>
		</Pressable>
	)
}

function StairsCard({
	floor,
	onCommit,
	isPending,
	isThis,
	isUnlocked,
	unlockDurationMs,
	holdDurationMs,
}: {
	floor: Floor
	onCommit: () => void
	isPending?: boolean
	isThis: boolean
	isUnlocked: boolean
	unlockDurationMs: number
	holdDurationMs: number
}) {
	const { isHolding, onPressIn, onPressOut } = useHoldGesture({
		holdDurationMs,
		disabled: !!isPending,
		onCommit,
	})

	const label =
		isThis && isPending
			? "Opening..."
			: isHolding
				? "Hold..."
				: isUnlocked
					? "Unlocked"
					: "Stairs"

	const phase: Phase = isHolding ? "holding" : isUnlocked ? "unlocked" : "idle"

	return (
		<Pressable
			className="flex-1 justify-between overflow-hidden rounded-xl bg-card p-5 select-none"
			style={{ height: 120, minWidth: 120, ...webHoldStyle }}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			disabled={isPending}
			{...webHoldGuards}
		>
			<View className="flex-row items-start justify-between">
				<View className="h-10 w-10 items-center justify-center rounded-[10px] bg-surface-inset">
					<StairsIcon size={20} color="#22D3EE" />
				</View>
				<Text className="text-3xl font-bold leading-none">{floor}</Text>
			</View>
			<Text className="text-sm font-semibold">{label}</Text>
			<ProgressBar
				phase={phase}
				holdDurationMs={holdDurationMs}
				unlockDurationMs={unlockDurationMs}
			/>
		</Pressable>
	)
}

function DoorControls({
	onOpenDoor,
	isPending,
	pendingAction,
	justUnlockedAction,
	unlockDurationMs = 5000,
	holdDurationMs = 200,
	onUnlockEnd,
}: DoorControlsProps) {
	const intercomAction: DoorAction = { entry: "intercom" }
	const elevatorAction: DoorAction = { entry: "elevator", floor: "all" }
	const stairs4Action: DoorAction = { entry: "stairs", floor: "4" }
	const stairs5Action: DoorAction = { entry: "stairs", floor: "5" }

	useEffect(() => {
		if (!justUnlockedAction) return
		const t = setTimeout(() => onUnlockEnd?.(), unlockDurationMs)
		return () => clearTimeout(t)
	}, [justUnlockedAction, unlockDurationMs, onUnlockEnd])

	return (
		<View className="w-full gap-4">
			<View className="flex-row items-center gap-1.5">
				<DoorOpen size={14} color="#22D3EE" />
				<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
					DOOR CONTROLS
				</Text>
			</View>
			<IntercomCard
				onCommit={() => onOpenDoor(intercomAction)}
				isPending={isPending}
				isThis={isSameAction(intercomAction, pendingAction)}
				isUnlocked={isSameAction(intercomAction, justUnlockedAction)}
				unlockDurationMs={unlockDurationMs}
				holdDurationMs={holdDurationMs}
			/>
			<View className="flex-row gap-3">
				<View className="flex-1 gap-3">
					<StairsCard
						floor="5"
						onCommit={() => onOpenDoor(stairs5Action)}
						isPending={isPending}
						isThis={isSameAction(stairs5Action, pendingAction)}
						isUnlocked={isSameAction(stairs5Action, justUnlockedAction)}
						unlockDurationMs={unlockDurationMs}
						holdDurationMs={holdDurationMs}
					/>
					<StairsCard
						floor="4"
						onCommit={() => onOpenDoor(stairs4Action)}
						isPending={isPending}
						isThis={isSameAction(stairs4Action, pendingAction)}
						isUnlocked={isSameAction(stairs4Action, justUnlockedAction)}
						unlockDurationMs={unlockDurationMs}
						holdDurationMs={holdDurationMs}
					/>
				</View>
				<ElevatorCard
					onCommit={() => onOpenDoor(elevatorAction)}
					isPending={isPending}
					isThis={isSameAction(elevatorAction, pendingAction)}
					isUnlocked={isSameAction(elevatorAction, justUnlockedAction)}
					unlockDurationMs={unlockDurationMs}
					holdDurationMs={holdDurationMs}
				/>
			</View>
		</View>
	)
}

export { DoorControls }
