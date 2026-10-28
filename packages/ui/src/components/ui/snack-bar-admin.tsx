import type { Client, SnackAccount, SnackSku } from "@batchmate/api-client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Archive, ArchiveRestore, Pencil } from "lucide-react-native"
import { type ReactNode, useState } from "react"
import { Image, Pressable, View } from "react-native"
import { cn } from "../../lib/cn"
import { getInitials } from "../../lib/stint-labels"
import { Input } from "./input"
import {
	ConfirmButton,
	formatCents,
	parseDollarsToCents,
	SnackBarBalance,
	SnackBarEntryList,
} from "./snack-bar"
import { Text } from "./text"

function errorText(error: unknown) {
	return error instanceof Error ? error.message : "Something went wrong"
}

function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<Text className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
			{children}
		</Text>
	)
}

function PrimaryButton({
	label,
	onPress,
	disabled,
	icon,
	className,
}: {
	label: string
	onPress: () => void
	disabled?: boolean
	icon?: ReactNode
	className?: string
}) {
	return (
		<Pressable
			className={cn(
				"h-10 flex-row items-center justify-center gap-2 rounded-md bg-cyan px-4",
				disabled && "opacity-50",
				className,
			)}
			onPress={onPress}
			disabled={disabled}
		>
			{icon}
			<Text className="text-sm font-semibold text-background">{label}</Text>
		</Pressable>
	)
}

export function SecondaryButton({
	label,
	onPress,
	disabled,
	icon,
	className,
}: {
	label: string
	onPress: () => void
	disabled?: boolean
	icon?: ReactNode
	className?: string
}) {
	return (
		<Pressable
			className={cn(
				"h-9 flex-row items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-surface-inset px-3",
				disabled && "opacity-50",
				className,
			)}
			onPress={onPress}
			disabled={disabled}
		>
			{icon}
			<Text className="text-xs font-semibold text-primary">{label}</Text>
		</Pressable>
	)
}

function SkuEditor({
	initialName = "",
	initialPrice = "",
	submitLabel,
	pendingLabel,
	isPending,
	onSubmit,
	onCancel,
}: {
	initialName?: string
	initialPrice?: string
	submitLabel: string
	pendingLabel: string
	isPending: boolean
	onSubmit: (input: { name: string; priceCents: number }) => void
	onCancel?: () => void
}) {
	const [name, setName] = useState(initialName)
	const [price, setPrice] = useState(initialPrice)
	const priceCents = parseDollarsToCents(price)
	const valid = name.trim().length > 0 && priceCents !== null

	return (
		<View className="gap-2">
			<Input value={name} onChangeText={setName} placeholder="Snack name" />
			<Input
				value={price}
				onChangeText={setPrice}
				placeholder="Price, e.g. 1.50"
				keyboardType="decimal-pad"
			/>
			<View className="flex-row gap-2">
				<PrimaryButton
					className="flex-1"
					label={isPending ? pendingLabel : submitLabel}
					disabled={!valid || isPending}
					onPress={() => {
						if (priceCents === null) return
						onSubmit({ name: name.trim(), priceCents })
					}}
				/>
				{onCancel && (
					<SecondaryButton
						className="h-10 flex-1"
						label="Cancel"
						onPress={onCancel}
					/>
				)}
			</View>
		</View>
	)
}

// Square icon button used for per-snack actions (write tag, edit, archive).
export function SkuIconButton({
	onPress,
	disabled,
	accessibilityLabel,
	children,
}: {
	onPress: () => void
	disabled?: boolean
	accessibilityLabel: string
	children: ReactNode
}) {
	return (
		<Pressable
			hitSlop={8}
			onPress={onPress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			className={cn(
				"h-9 w-9 items-center justify-center rounded-md border border-primary/30 bg-surface-inset",
				disabled && "opacity-50",
			)}
		>
			{children}
		</Pressable>
	)
}

export type SnackBarSkuManagerProps = {
	api: Client
	// Platform-specific icon buttons shown before edit/archive on snacks that
	// aren't archived, e.g. "Write tag" on devices with NFC. Use SkuIconButton.
	renderSkuActions?: (sku: SnackSku) => ReactNode
	header?: ReactNode
}

export function SnackBarSkuManager({
	api,
	renderSkuActions,
	header,
}: SnackBarSkuManagerProps) {
	const queryClient = useQueryClient()
	const skus = useQuery(api.snackBarAdminSkus.queryOptions({}))
	const [editingId, setEditingId] = useState<string | null>(null)
	const [formKey, setFormKey] = useState(0)

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: api.snackBarAdminSkus.key() })

	const create = useMutation({
		...api.snackBarAdminSkuCreate.mutationOptions(),
		onSuccess: () => {
			setFormKey((k) => k + 1)
			invalidate()
		},
	})
	const update = useMutation({
		...api.snackBarAdminSkuUpdate.mutationOptions(),
		onSuccess: () => {
			setEditingId(null)
			invalidate()
		},
	})

	return (
		<View className="gap-6">
			{header}

			<View className="gap-3 rounded-xl border border-primary/30 bg-card p-5">
				<Text className="text-base font-semibold">Add a snack</Text>
				<SkuEditor
					key={formKey}
					submitLabel="Add"
					pendingLabel="Adding..."
					isPending={create.isPending}
					onSubmit={(input) => create.mutate(input)}
				/>
				{create.error && (
					<Text className="text-sm text-destructive">
						{errorText(create.error)}
					</Text>
				)}
			</View>

			<View className="gap-3">
				<SectionLabel>
					{skus.data ? `${skus.data.length} snacks` : "Snacks"}
				</SectionLabel>
				{skus.isLoading && (
					<Text className="text-sm text-text-tertiary">Loading...</Text>
				)}
				{skus.error && (
					<Text className="text-sm text-destructive">
						{errorText(skus.error)}
					</Text>
				)}
				{update.error && (
					<Text className="text-sm text-destructive">
						{errorText(update.error)}
					</Text>
				)}
				{skus.data?.length === 0 && (
					<Text className="text-sm text-text-tertiary">
						No snacks yet. Add one above, then write it to a tag.
					</Text>
				)}
				{skus.data?.map((sku) =>
					editingId === sku.id ? (
						<View
							key={sku.id}
							className="gap-3 rounded-xl border border-primary/30 bg-card p-4"
						>
							<SkuEditor
								initialName={sku.name}
								initialPrice={(sku.priceCents / 100).toFixed(2)}
								submitLabel="Save"
								pendingLabel="Saving..."
								isPending={update.isPending}
								onSubmit={(input) => update.mutate({ id: sku.id, ...input })}
								onCancel={() => setEditingId(null)}
							/>
						</View>
					) : (
						<View
							key={sku.id}
							className={cn(
								"gap-3 rounded-xl border border-primary/30 bg-card p-4",
								sku.archived && "opacity-60",
							)}
						>
							<View className="flex-row items-center gap-3">
								<View className="flex-1 gap-0.5">
									<Text className="text-base font-semibold">{sku.name}</Text>
									<Text className="font-mono text-xs text-text-tertiary">
										{formatCents(sku.priceCents)}
										{sku.archived ? " · Archived" : ""}
									</Text>
								</View>
								{!sku.archived && renderSkuActions?.(sku)}
								<SkuIconButton
									accessibilityLabel={`Edit ${sku.name}`}
									onPress={() => setEditingId(sku.id)}
								>
									<Pencil size={16} color="#22D3EE" />
								</SkuIconButton>
								<SkuIconButton
									accessibilityLabel={
										sku.archived
											? `Unarchive ${sku.name}`
											: `Archive ${sku.name}`
									}
									disabled={update.isPending}
									onPress={() =>
										update.mutate({ id: sku.id, archived: !sku.archived })
									}
								>
									{sku.archived ? (
										<ArchiveRestore size={16} color="#22D3EE" />
									) : (
										<Archive size={16} color="#94A3B8" />
									)}
								</SkuIconButton>
							</View>
						</View>
					),
				)}
			</View>
		</View>
	)
}

function AccountAvatar({ account }: { account: SnackAccount }) {
	return (
		<View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-inset">
			{account.image ? (
				<Image source={{ uri: account.image }} className="h-full w-full" />
			) : (
				<Text className="text-xs font-semibold text-text-secondary">
					{getInitials(account.name)}
				</Text>
			)}
		</View>
	)
}

export function SnackBarAccounts({
	api,
	onSelectAccount,
}: {
	api: Client
	onSelectAccount: (account: SnackAccount) => void
}) {
	const [scope, setScope] = useState<"unsettled" | "all">("unsettled")
	const accounts = useQuery(
		api.snackBarAdminAccounts.queryOptions({ input: { scope } }),
	)
	const totalOwed = accounts.data
		?.filter((a) => a.balanceCents > 0)
		.reduce((sum, a) => sum + a.balanceCents, 0)

	return (
		<View className="gap-4">
			{scope === "unsettled" && (
				<SnackBarBalance balanceCents={totalOwed} label="Total outstanding" />
			)}
			<View className="flex-row gap-2">
				{(["unsettled", "all"] as const).map((s) => (
					<Pressable
						key={s}
						onPress={() => setScope(s)}
						className={cn(
							"rounded-full border px-3 py-1.5",
							scope === s
								? "border-cyan bg-cyan/10"
								: "border-primary/20 bg-surface-inset",
						)}
					>
						<Text
							className={cn(
								"text-xs font-semibold",
								scope === s ? "text-primary" : "text-text-secondary",
							)}
						>
							{s === "unsettled" ? "Unpaid" : "Everyone"}
						</Text>
					</Pressable>
				))}
			</View>
			{accounts.isLoading && (
				<Text className="text-sm text-text-tertiary">Loading...</Text>
			)}
			{accounts.error && (
				<Text className="text-sm text-destructive">
					{errorText(accounts.error)}
				</Text>
			)}
			{accounts.data?.length === 0 && (
				<Text className="py-6 text-center text-sm text-text-tertiary">
					{scope === "unsettled"
						? "Everyone is settled up."
						: "No Snack Bar activity yet."}
				</Text>
			)}
			{accounts.data?.map((account) => (
				<Pressable
					key={account.userId}
					onPress={() => onSelectAccount(account)}
					className="flex-row items-center gap-3 rounded-xl bg-card px-4 py-3"
				>
					<AccountAvatar account={account} />
					<View className="flex-1 gap-0.5">
						<Text className="text-[15px] font-semibold" numberOfLines={1}>
							{account.name}
						</Text>
						<Text className="text-xs text-text-tertiary">
							Last activity{" "}
							{new Date(account.lastActivityAt).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
							})}
						</Text>
					</View>
					<Text
						className={cn(
							"font-mono text-sm font-semibold",
							account.balanceCents > 0 ? "text-foreground" : "text-[#4ADE80]",
						)}
					>
						{account.balanceCents < 0
							? `${formatCents(-account.balanceCents)} credit`
							: formatCents(account.balanceCents)}
					</Text>
				</Pressable>
			))}
		</View>
	)
}

export function SnackBarAccountDetail({
	api,
	userId,
}: {
	api: Client
	userId: string
}) {
	const queryClient = useQueryClient()
	const detail = useQuery(
		api.snackBarAdminAccount.queryOptions({ input: { userId } }),
	)
	const [amount, setAmount] = useState<string | null>(null)
	const [note, setNote] = useState("")
	const [recipient, setRecipient] = useState("")

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: api.key() })

	const payment = useMutation({
		...api.snackBarAdminPayment.mutationOptions(),
		onSuccess: () => {
			setAmount(null)
			setNote("")
			setRecipient("")
			invalidate()
		},
	})
	const voidEntry = useMutation({
		...api.snackBarAdminVoid.mutationOptions(),
		onSuccess: invalidate,
	})

	if (detail.isLoading) {
		return <Text className="text-sm text-text-tertiary">Loading...</Text>
	}
	if (!detail.data) {
		return (
			<Text className="text-sm text-destructive">
				{errorText(detail.error)}
			</Text>
		)
	}

	const { account, entries } = detail.data
	const suggested =
		account.balanceCents > 0 ? (account.balanceCents / 100).toFixed(2) : ""
	const amountValue = amount ?? suggested
	const amountCents = parseDollarsToCents(amountValue)

	return (
		<View className="gap-6">
			<View className="flex-row items-center gap-3">
				<AccountAvatar account={account} />
				<Text className="flex-1 text-lg font-semibold">{account.name}</Text>
			</View>

			<SnackBarBalance balanceCents={account.balanceCents} label="Owes" />

			<View className="gap-3 rounded-xl border border-primary/30 bg-card p-5">
				<Text className="text-base font-semibold">Record a payment</Text>
				<Input
					value={amountValue}
					onChangeText={setAmount}
					placeholder="Amount, e.g. 5.00"
					keyboardType="decimal-pad"
				/>
				<Input
					value={note}
					onChangeText={setNote}
					placeholder="Note (optional): cash, Venmo..."
				/>
				<Input
					value={recipient}
					onChangeText={setRecipient}
					placeholder="Payment recipient (optional)"
				/>
				<PrimaryButton
					label={payment.isPending ? "Recording..." : "Record payment"}
					disabled={!amountCents || payment.isPending}
					onPress={() => {
						if (!amountCents) return
						payment.mutate({
							userId,
							amountCents,
							note: note.trim() || undefined,
							recipient: recipient.trim() || undefined,
						})
					}}
				/>
				{payment.error && (
					<Text className="text-sm text-destructive">
						{errorText(payment.error)}
					</Text>
				)}
			</View>

			<View className="gap-3">
				<SectionLabel>History</SectionLabel>
				{voidEntry.error && (
					<Text className="text-sm text-destructive">
						{errorText(voidEntry.error)}
					</Text>
				)}
				<SnackBarEntryList
					entries={entries}
					emptyMessage="No transactions."
					renderTrailing={(entry) =>
						entry.canVoid ? (
							<ConfirmButton
								compact
								label="Void"
								confirmLabel="Confirm"
								pendingLabel="..."
								isPending={
									voidEntry.isPending && voidEntry.variables?.id === entry.id
								}
								onConfirm={() => voidEntry.mutate({ id: entry.id })}
							/>
						) : null
					}
				/>
			</View>
		</View>
	)
}

function isoDate(date: Date) {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, "0")
	const d = String(date.getDate()).padStart(2, "0")
	return `${y}-${m}-${d}`
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function SnackBarExport({
	api,
	onExport,
}: {
	api: Client
	// Hands the finished CSV to the platform: a download on web, the share
	// sheet on mobile.
	onExport: (file: { filename: string; csv: string }) => Promise<void>
}) {
	const accounts = useQuery(
		api.snackBarAdminAccounts.queryOptions({ input: { scope: "all" } }),
	)
	const [from, setFrom] = useState("")
	const [to, setTo] = useState("")
	const [userId, setUserId] = useState<string | null>(null)
	const [showUsers, setShowUsers] = useState(false)

	const exportCsv = useMutation({
		mutationFn: async () => {
			const file = await api.snackBarAdminExport.call({
				userId: userId ?? undefined,
				from: from || undefined,
				to: to || undefined,
			})
			await onExport(file)
		},
	})

	const fromValid = from === "" || DATE_PATTERN.test(from)
	const toValid = to === "" || DATE_PATTERN.test(to)
	const selectedUser = accounts.data?.find((a) => a.userId === userId)

	const now = new Date()
	const presets = [
		{ label: "All time", from: "", to: "" },
		{
			label: "This month",
			from: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
			to: isoDate(now),
		},
		{
			label: "Last month",
			from: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
			to: isoDate(new Date(now.getFullYear(), now.getMonth(), 0)),
		},
	]

	return (
		<View className="gap-3 rounded-xl border border-primary/30 bg-card p-5">
			<Text className="text-base font-semibold">Export to CSV</Text>

			<View className="flex-row flex-wrap gap-2">
				{presets.map((preset) => (
					<SecondaryButton
						key={preset.label}
						label={preset.label}
						onPress={() => {
							setFrom(preset.from)
							setTo(preset.to)
						}}
					/>
				))}
			</View>

			<View className="flex-row gap-2">
				<View className="flex-1 gap-1">
					<Text className="text-xs text-text-tertiary">From</Text>
					<Input value={from} onChangeText={setFrom} placeholder="YYYY-MM-DD" />
				</View>
				<View className="flex-1 gap-1">
					<Text className="text-xs text-text-tertiary">To</Text>
					<Input value={to} onChangeText={setTo} placeholder="YYYY-MM-DD" />
				</View>
			</View>

			<View className="gap-1">
				<Text className="text-xs text-text-tertiary">Person</Text>
				<Pressable
					onPress={() => setShowUsers((s) => !s)}
					className="h-9 justify-center rounded-md border border-input px-3"
				>
					<Text className="text-sm">{selectedUser?.name ?? "Everyone"}</Text>
				</Pressable>
				{showUsers && (
					<View className="overflow-hidden rounded-md border border-input">
						{[{ userId: null, name: "Everyone" }, ...(accounts.data ?? [])].map(
							(a) => (
								<Pressable
									key={a.userId ?? "all"}
									onPress={() => {
										setUserId(a.userId)
										setShowUsers(false)
									}}
									className={cn(
										"px-3 py-2.5",
										a.userId === userId && "bg-cyan/10",
									)}
								>
									<Text className="text-sm">{a.name}</Text>
								</Pressable>
							),
						)}
					</View>
				)}
			</View>

			<PrimaryButton
				label={exportCsv.isPending ? "Exporting..." : "Export CSV"}
				disabled={!fromValid || !toValid || exportCsv.isPending}
				onPress={() => exportCsv.mutate()}
			/>
			{(!fromValid || !toValid) && (
				<Text className="text-xs text-destructive">
					Dates must look like 2026-10-28.
				</Text>
			)}
			{exportCsv.error && (
				<Text className="text-sm text-destructive">
					{errorText(exportCsv.error)}
				</Text>
			)}
			<Text className="text-xs text-text-tertiary">
				Dates are in New York time and include both ends. Removed transactions
				are included, with a voided_at column.
			</Text>
		</View>
	)
}
