import type { Client, SnackLedgerEntry } from "@batchmate/api-client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Plus, TriangleAlert, Undo2 } from "lucide-react-native"
import { useEffect } from "react"
import { ActivityIndicator, AppState, Pressable, View } from "react-native"
import { cn } from "../../lib/cn"
import { formatCents, formatDateTime, snackEntryTitle } from "./snack-bar"
import { Text } from "./text"

// Snack links are `/snack/<skuId>`. Before anything else (even the login
// check), clients redirect to `/snack/<skuId>?k=<key>` with a fresh key. The
// server records at most one purchase per key, so reloading the page, or
// reopening it from history, shows the original purchase instead of buying
// another snack.
export const SNACK_LINK_KEY_PARAM = "k"

const KEY_ALPHABET =
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

export function newSnackLinkKey(length = 22) {
	const bytes = new Uint8Array(length)
	if (typeof globalThis.crypto?.getRandomValues === "function") {
		globalThis.crypto.getRandomValues(bytes)
	} else {
		// Hermes has no Web Crypto. Keys only need to be unique, not secret.
		for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256)
	}
	return Array.from(bytes, (b) => KEY_ALPHABET[b % KEY_ALPHABET.length]).join(
		"",
	)
}

type PurchaseResult = { entry: SnackLedgerEntry; balanceCents: number }

function errorText(error: unknown) {
	return error instanceof Error ? error.message : "Something went wrong."
}

// How long the summary stays up after the purchase was made. After that it
// sends you home, so an app left open (or backgrounded) or a browser tab left
// on the page doesn't sit on it.
export const SNACK_SUMMARY_TTL_MS = 2 * 60 * 1000

// Calls onExpire once `deadline` passes. Timers are paused or throttled while
// the app or tab is in the background, so also re-check on returning to the
// foreground.
function useExpireAt(deadline: number | null, onExpire: () => void) {
	useEffect(() => {
		if (deadline === null) return
		let done = false
		const check = () => {
			if (!done && Date.now() >= deadline) {
				done = true
				onExpire()
			}
		}
		check()
		const timer = setTimeout(check, Math.max(0, deadline - Date.now()) + 250)
		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") check()
		})
		return () => {
			done = true
			clearTimeout(timer)
			subscription.remove()
		}
	}, [deadline, onExpire])
}

export type SnackPurchaseSummaryProps = {
	api: Client
	skuId: string
	idempotencyKey: string
	source: "nfc" | "web"
	onViewTab: () => void
	// Leave the summary for home, replacing it in history. Called
	// SNACK_SUMMARY_TTL_MS after the purchase was made.
	onExpire: () => void
}

export function SnackPurchaseSummary({
	api,
	skuId,
	idempotencyKey,
	source,
	onViewTab,
	onExpire,
}: SnackPurchaseSummaryProps) {
	const queryClient = useQueryClient()
	// Kept outside api.key() so invalidating Snack Bar queries after an undo
	// doesn't re-run the purchase (which would just return the same entry).
	const queryKey = ["snack-purchase", idempotencyKey]

	const purchase = useQuery({
		queryKey,
		queryFn: async () => {
			const result = await api.snackBarPurchase.call({
				skuId,
				idempotencyKey,
				source,
			})
			queryClient.invalidateQueries({ queryKey: api.key() })
			return result
		},
		staleTime: Number.POSITIVE_INFINITY,
		gcTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		// Safe to retry: the key makes repeats return the same purchase.
		retry: 2,
	})

	const onEntryChanged = (result: PurchaseResult) => {
		queryClient.setQueryData<PurchaseResult>(queryKey, result)
		queryClient.invalidateQueries({ queryKey: api.key() })
	}
	const undo = useMutation({
		...api.snackBarVoid.mutationOptions(),
		onSuccess: onEntryChanged,
	})
	const buyAnother = useMutation({
		...api.snackBarBuyAnother.mutationOptions(),
		onSuccess: onEntryChanged,
	})
	const busy = undo.isPending || buyAnother.isPending

	const createdAt = purchase.data?.entry.createdAt
	useExpireAt(
		createdAt ? Date.parse(createdAt) + SNACK_SUMMARY_TTL_MS : null,
		onExpire,
	)

	if (purchase.isPending) {
		return (
			<View className="items-center gap-4 py-16">
				<ActivityIndicator color="#22D3EE" size="large" />
				<Text className="text-sm text-text-tertiary">
					Adding to your Snack Bar tab...
				</Text>
			</View>
		)
	}

	if (purchase.isError) {
		return (
			<View className="items-center gap-5 rounded-xl border border-destructive/30 bg-card p-6">
				<TriangleAlert size={32} color="#F87171" />
				<Text className="text-center text-base">
					{errorText(purchase.error)}
				</Text>
				<Pressable
					className="h-11 w-full items-center justify-center rounded-md border border-primary/40 bg-surface-inset"
					onPress={() => purchase.refetch()}
				>
					<Text className="text-sm font-semibold text-primary">Try again</Text>
				</Pressable>
				<Pressable onPress={onViewTab} hitSlop={8}>
					<Text className="text-sm font-medium text-primary">
						View my Snack Bar tab →
					</Text>
				</Pressable>
			</View>
		)
	}

	const { entry } = purchase.data
	const undone = entry.voidedAt !== null

	return (
		<View className="gap-5">
			<View className="items-center gap-4 rounded-xl border border-primary/30 bg-card p-6">
				<View
					className={cn(
						"h-16 w-16 items-center justify-center rounded-full",
						undone ? "bg-surface-inset" : "bg-cyan/10",
					)}
				>
					{undone ? (
						<Undo2 size={30} color="#64748B" />
					) : (
						<Check size={32} color="#22D3EE" />
					)}
				</View>
				<Text className="text-sm text-text-tertiary">
					{undone
						? "Purchase undone"
						: entry.quantity > 1
							? `You bought ${entry.quantity} snacks`
							: "You bought a snack"}
				</Text>
				<View className="items-center gap-1">
					<Text
						className={cn(
							"text-center text-2xl font-semibold",
							undone && "text-text-tertiary line-through",
						)}
					>
						{snackEntryTitle(entry)}
					</Text>
					<Text
						className={cn(
							"font-mono text-3xl font-semibold",
							undone ? "text-text-tertiary line-through" : "text-primary",
						)}
					>
						{formatCents(entry.amountCents)}
					</Text>
					<Text className="text-xs text-text-tertiary">
						{formatDateTime(entry.createdAt)}
					</Text>
				</View>
			</View>

			{(undo.error || buyAnother.error) && (
				<Text className="text-center text-sm text-destructive">
					{errorText(undo.error ?? buyAnother.error)}
				</Text>
			)}

			{!undone &&
				(entry.canVoid ? (
					<>
						<Pressable
							className={cn(
								"h-12 flex-row items-center justify-center gap-2 rounded-md border border-primary/40 bg-surface-inset",
								busy && "opacity-50",
							)}
							disabled={busy}
							onPress={() =>
								buyAnother.mutate({
									id: entry.id,
									expectedQuantity: entry.quantity,
								})
							}
						>
							<Plus size={16} color="#22D3EE" />
							<Text className="text-sm font-semibold text-primary">
								{buyAnother.isPending ? "Adding..." : "Buy another"}
							</Text>
						</Pressable>
						<Pressable
							className={cn(
								"h-12 flex-row items-center justify-center gap-2 rounded-md border border-destructive/40 bg-surface-inset",
								busy && "opacity-50",
							)}
							disabled={busy}
							onPress={() => undo.mutate({ id: entry.id })}
						>
							<Undo2 size={16} color="#F87171" />
							<Text className="text-sm font-semibold text-[#F87171]">
								{undo.isPending ? "Undoing..." : "Undo"}
							</Text>
						</Pressable>
					</>
				) : (
					<Text className="text-center text-xs text-text-tertiary">
						Purchases can be undone for 24 hours, until you make a payment. Ask
						a Snack Bar admin if something's wrong.
					</Text>
				))}

			<Pressable
				className="h-12 items-center justify-center rounded-md bg-cyan"
				onPress={onViewTab}
			>
				<Text className="text-sm font-semibold text-background">
					View my Snack Bar tab
				</Text>
			</Pressable>
		</View>
	)
}
