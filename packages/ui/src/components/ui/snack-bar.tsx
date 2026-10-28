import type { SnackLedgerEntry } from "@batchmate/api-client"
import { Ban, Cookie, HandCoins } from "lucide-react-native"
import { type ReactNode, useState } from "react"
import { Pressable, View } from "react-native"
import { cn } from "../../lib/cn"
import { ExternalLink } from "./external-link"
import { Text } from "./text"

export function formatCents(cents: number): string {
	const sign = cents < 0 ? "-" : ""
	return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`
}

// "1.5", "$1.50", "2" → cents. Returns null for anything else.
export function parseDollarsToCents(value: string): number | null {
	const match = /^\$?\s*(\d{1,4})(?:\.(\d{1,2}))?$/.exec(value.trim())
	if (!match) return null
	return Number(match[1]) * 100 + Number((match[2] ?? "0").padEnd(2, "0"))
}

function formatTime(iso: string) {
	return new Date(iso).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	})
}

function formatDay(iso: string) {
	return new Date(iso).toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	})
}

export function formatDateTime(iso: string) {
	return new Date(iso).toLocaleString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	})
}

export function snackEntryTitle(entry: SnackLedgerEntry) {
	if (entry.kind === "payment") return "Payment"
	const name = entry.skuName ?? "Snack"
	return entry.quantity > 1 ? `${name} ×${entry.quantity}` : name
}

const SOURCE_LABELS: Record<SnackLedgerEntry["source"], string> = {
	nfc: "Tapped a tag",
	web: "Bought on the web",
	admin: "Recorded by an admin",
}

export function SnackBarBalance({
	balanceCents,
	label = "You owe",
	className,
}: {
	balanceCents: number | undefined
	label?: string
	className?: string
}) {
	const settled = balanceCents === 0
	const credit = balanceCents !== undefined && balanceCents < 0
	return (
		<View
			className={cn(
				"gap-1 rounded-xl border border-primary/30 bg-card p-5",
				className,
			)}
		>
			<Text className="text-xs text-text-tertiary">
				{credit ? "Credit" : settled ? "Balance" : label}
			</Text>
			<Text
				className={cn(
					"font-mono text-3xl font-semibold",
					settled || credit ? "text-[#4ADE80]" : "text-foreground",
				)}
			>
				{balanceCents === undefined ? "—" : formatCents(Math.abs(balanceCents))}
			</Text>
			{settled && (
				<Text className="text-xs text-text-tertiary">All settled up</Text>
			)}
		</View>
	)
}

export function SnackBarEntryRow({
	entry,
	onPress,
	trailing,
}: {
	entry: SnackLedgerEntry
	onPress?: () => void
	trailing?: ReactNode
}) {
	const voided = entry.voidedAt !== null
	const payment = entry.kind === "payment"
	const Icon = payment ? HandCoins : Cookie
	return (
		<Pressable
			onPress={onPress}
			disabled={!onPress}
			className="flex-row items-center gap-3 rounded-xl bg-card px-4 py-3"
		>
			<View className="h-9 w-9 items-center justify-center rounded-full bg-surface-inset">
				{voided ? (
					<Ban size={16} color="#64748B" />
				) : (
					<Icon size={16} color={payment ? "#4ADE80" : "#22D3EE"} />
				)}
			</View>
			<View className="flex-1 gap-0.5">
				<Text
					className={cn(
						"text-[15px] font-semibold",
						voided && "text-text-tertiary line-through",
					)}
					numberOfLines={1}
				>
					{snackEntryTitle(entry)}
				</Text>
				<Text className="text-xs text-text-tertiary">
					{formatTime(entry.createdAt)}
					{voided ? " · Removed" : ""}
				</Text>
			</View>
			<Text
				className={cn(
					"font-mono text-sm font-semibold",
					voided
						? "text-text-tertiary line-through"
						: payment
							? "text-[#4ADE80]"
							: "text-foreground",
				)}
			>
				{payment
					? `+${formatCents(-entry.amountCents)}`
					: formatCents(entry.amountCents)}
			</Text>
			{trailing}
		</Pressable>
	)
}

export function SnackBarEntryList({
	entries,
	onSelectEntry,
	renderTrailing,
	emptyMessage = "Nothing here yet. Tap a Snack Bar tag to grab a snack.",
}: {
	entries: SnackLedgerEntry[]
	onSelectEntry?: (entry: SnackLedgerEntry) => void
	renderTrailing?: (entry: SnackLedgerEntry) => ReactNode
	emptyMessage?: string
}) {
	if (entries.length === 0) {
		return (
			<View className="items-center py-8">
				<Text className="text-center text-sm text-text-tertiary">
					{emptyMessage}
				</Text>
			</View>
		)
	}

	const groups: { day: string; entries: SnackLedgerEntry[] }[] = []
	for (const entry of entries) {
		const day = formatDay(entry.createdAt)
		const last = groups[groups.length - 1]
		if (last?.day === day) {
			last.entries.push(entry)
		} else {
			groups.push({ day, entries: [entry] })
		}
	}

	return (
		<View className="gap-5">
			{groups.map((group) => (
				<View key={group.day} className="gap-2">
					<Text className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
						{group.day}
					</Text>
					{group.entries.map((entry) => (
						<SnackBarEntryRow
							key={entry.id}
							entry={entry}
							onPress={onSelectEntry ? () => onSelectEntry(entry) : undefined}
							trailing={renderTrailing?.(entry)}
						/>
					))}
				</View>
			))}
		</View>
	)
}

// Two-step confirm instead of a native dialog so it behaves the same on web.
export function ConfirmButton({
	label,
	confirmLabel = "Tap again to confirm",
	pendingLabel = "Working...",
	isPending,
	onConfirm,
	className,
	compact,
}: {
	label: string
	confirmLabel?: string
	pendingLabel?: string
	isPending?: boolean
	onConfirm: () => void
	className?: string
	compact?: boolean
}) {
	const [armed, setArmed] = useState(false)
	return (
		<Pressable
			className={cn(
				"items-center justify-center rounded-md border border-destructive/40",
				compact ? "h-8 px-3" : "h-10 px-4",
				armed ? "bg-destructive" : "bg-surface-inset",
				isPending && "opacity-50",
				className,
			)}
			disabled={isPending}
			onPress={() => {
				if (armed) {
					setArmed(false)
					onConfirm()
				} else {
					setArmed(true)
				}
			}}
		>
			<Text
				className={cn(
					"font-semibold",
					compact ? "text-xs" : "text-sm",
					armed ? "text-white" : "text-[#F87171]",
				)}
			>
				{isPending ? pendingLabel : armed ? confirmLabel : label}
			</Text>
		</Pressable>
	)
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<View className="flex-row items-start justify-between gap-4 px-4 py-3.5">
			<Text className="text-sm text-text-tertiary">{label}</Text>
			<Text className="flex-1 text-right text-sm font-medium">{value}</Text>
		</View>
	)
}

export function SnackBarEntryDetail({
	entry,
	onVoid,
	isVoiding,
	errorMessage,
}: {
	entry: SnackLedgerEntry
	onVoid?: () => void
	isVoiding?: boolean
	errorMessage?: string | null
}) {
	const voided = entry.voidedAt !== null
	const payment = entry.kind === "payment"

	return (
		<View className="gap-5">
			<View className="items-center gap-1 rounded-xl border border-primary/30 bg-card p-6">
				<Text
					className={cn(
						"text-xl font-semibold",
						voided && "text-text-tertiary line-through",
					)}
				>
					{snackEntryTitle(entry)}
				</Text>
				<Text
					className={cn(
						"font-mono text-3xl font-semibold",
						voided
							? "text-text-tertiary line-through"
							: payment
								? "text-[#4ADE80]"
								: "text-foreground",
					)}
				>
					{payment
						? `+${formatCents(-entry.amountCents)}`
						: formatCents(entry.amountCents)}
				</Text>
				{voided && (
					<Text className="text-xs font-medium text-[#F87171]">Removed</Text>
				)}
			</View>

			<View className="overflow-hidden rounded-xl bg-card">
				<DetailRow label="When" value={formatDateTime(entry.createdAt)} />
				<View className="h-px bg-divider" />
				{entry.kind === "purchase" && (
					<>
						<DetailRow
							label="Quantity"
							value={`${entry.quantity} × ${formatCents(entry.unitPriceCents)}`}
						/>
						<View className="h-px bg-divider" />
					</>
				)}
				<DetailRow
					label="How"
					value={
						entry.source === "admin" && entry.recordedByName
							? `Recorded by ${entry.recordedByName}`
							: SOURCE_LABELS[entry.source]
					}
				/>
				{entry.note && (
					<>
						<View className="h-px bg-divider" />
						<DetailRow label="Note" value={entry.note} />
					</>
				)}
				{entry.voidedAt && (
					<>
						<View className="h-px bg-divider" />
						<DetailRow label="Removed" value={formatDateTime(entry.voidedAt)} />
					</>
				)}
			</View>

			{errorMessage && (
				<Text className="text-center text-sm text-destructive">
					{errorMessage}
				</Text>
			)}

			{entry.canVoid && onVoid ? (
				<ConfirmButton
					label="Remove this transaction"
					confirmLabel="Tap again to remove"
					pendingLabel="Removing..."
					isPending={isVoiding}
					onConfirm={onVoid}
				/>
			) : (
				!voided &&
				!payment && (
					<Text className="text-center text-xs text-text-tertiary">
						Purchases can be removed for 24 hours, until you make a payment. Ask
						a Snack Bar admin if something's wrong.
					</Text>
				)
			)}
		</View>
	)
}

// Who people pay to settle their tab. Collection is manual for now.
export const SNACK_BAR_CONTACT = {
	label: "Rose Hall (F2'25)",
	zulipUrl: "https://recurse.zulipchat.com/#narrow/dm/902138",
}

export function SnackBarSettleUp() {
	return (
		<View className="flex-row items-center gap-3 rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3">
			<Text className="flex-1 text-xs text-text-secondary">
				Want to settle your tab? Tell {SNACK_BAR_CONTACT.label} on Zulip!
			</Text>
			<ExternalLink
				href={SNACK_BAR_CONTACT.zulipUrl}
				className="h-8 items-center justify-center rounded-md bg-cyan px-3"
			>
				<Text className="text-xs font-semibold text-background">Message</Text>
			</ExternalLink>
		</View>
	)
}
