import { Calendar, Pencil, Plus, Trash2 } from "lucide-react-native"
import { useState } from "react"
import { Pressable, View } from "react-native"
import { Input } from "./input"
import { Text } from "./text"

export interface PresentationItem {
	id: string
	presenter: string
	title: string
	date: number | null
	lastUpdated: number | null
}

export interface PresentationsListProps {
	sessionStartMs: number | null
	presentations: PresentationItem[]
	maxSignUps?: number
	defaultPresenterName?: string
	isLoading?: boolean
	hasError?: boolean
	emptyMessage?: string
	onCreate: (input: { presenter: string; title: string }) => void
	onUpdate: (input: { id: string; presenter: string; title: string }) => void
	onDelete: (item: PresentationItem) => void
	isCreating?: boolean
	isUpdating?: boolean
}

function formatSessionDate(ms: number): string {
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "America/New_York",
		weekday: "long",
		month: "long",
		day: "numeric",
	}).format(new Date(ms))
}

function PresentationsList({
	sessionStartMs,
	presentations,
	maxSignUps,
	defaultPresenterName = "",
	isLoading,
	hasError,
	emptyMessage = "No sign-ups yet — be the first!",
	onCreate,
	onUpdate,
	onDelete,
	isCreating,
	isUpdating,
}: PresentationsListProps) {
	const isFull = maxSignUps != null && presentations.length >= maxSignUps
	// `null` = untouched (show default); any string = user-controlled (even "")
	const [presenterInput, setPresenterInput] = useState<string | null>(null)
	const [titleInput, setTitleInput] = useState("")
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editPresenter, setEditPresenter] = useState("")
	const [editTitle, setEditTitle] = useState("")

	const presenterValue = presenterInput ?? defaultPresenterName

	const sessionLabel =
		sessionStartMs != null ? formatSessionDate(sessionStartMs) : null

	function submitCreate() {
		const presenter = presenterValue.trim()
		const title = titleInput.trim()
		if (!presenter) return
		onCreate({ presenter, title })
		setPresenterInput(null)
		setTitleInput("")
	}

	function startEdit(item: PresentationItem) {
		setEditingId(item.id)
		setEditPresenter(item.presenter)
		setEditTitle(item.title)
	}

	function submitEdit(id: string) {
		const presenter = editPresenter.trim()
		if (!presenter) return
		onUpdate({ id, presenter, title: editTitle.trim() })
		setEditingId(null)
	}

	return (
		<View className="w-full gap-6">
			{sessionLabel && (
				<View className="flex-row items-center gap-1.5">
					<Calendar size={14} color="#22D3EE" />
					<Text className="text-sm font-medium text-primary">
						{sessionLabel}
					</Text>
				</View>
			)}

			{isFull ? (
				<View className="items-center gap-1 rounded-xl border border-primary/30 bg-card p-5">
					<Text className="text-base font-semibold">
						All slots are full for this session
					</Text>
					<Text className="text-xs text-text-tertiary">
						{maxSignUps} sign-ups — come back next week.
					</Text>
				</View>
			) : (
				<View className="gap-3 rounded-xl border border-primary/30 bg-card p-5">
					<Text className="text-base font-semibold">Sign up to present</Text>
					<View className="gap-2">
						<Text className="text-xs text-text-tertiary">
							Presentation title
						</Text>
						<Input
							value={titleInput}
							onChangeText={setTitleInput}
							placeholder="What will you present?"
						/>
					</View>
					<View className="gap-2">
						<Text className="text-xs text-text-tertiary">Your name</Text>
						<Input
							value={presenterValue}
							onChangeText={setPresenterInput}
							placeholder="Your name"
						/>
					</View>
					<Pressable
						className="h-10 flex-row items-center justify-center gap-2 rounded-md bg-cyan disabled:opacity-50"
						onPress={submitCreate}
						disabled={!!isCreating || !presenterValue.trim()}
					>
						<Plus size={16} color="#0A0F1C" />
						<Text className="text-sm font-semibold text-background">
							{isCreating ? "Adding..." : "Sign up"}
						</Text>
					</Pressable>
				</View>
			)}

			{isLoading && (
				<View className="items-center py-8">
					<Text className="text-sm text-text-tertiary">Loading...</Text>
				</View>
			)}

			{hasError && (
				<View className="items-center py-8">
					<Text className="text-sm text-destructive">
						Failed to load presentations
					</Text>
				</View>
			)}

			{!isLoading && !hasError && (
				<View className="gap-3">
					<Text className="font-mono text-[11px] font-semibold tracking-widest text-text-tertiary">
						{presentations.length}
						{maxSignUps != null ? ` OF ${maxSignUps}` : ""}{" "}
						{presentations.length === 1 ? "SIGN-UP" : "SIGN-UPS"}
					</Text>
					{presentations.length === 0 && (
						<View className="items-center py-8">
							<Text className="text-sm text-text-tertiary">{emptyMessage}</Text>
						</View>
					)}
					{presentations.map((p) =>
						editingId === p.id ? (
							<View
								key={p.id}
								className="gap-3 rounded-xl border border-primary/30 bg-card p-4"
							>
								<Input
									value={editTitle}
									onChangeText={setEditTitle}
									placeholder="Title"
								/>
								<Input
									value={editPresenter}
									onChangeText={setEditPresenter}
									placeholder="Presenter"
								/>
								<View className="flex-row gap-2">
									<Pressable
										className="h-9 flex-1 items-center justify-center rounded-md bg-cyan disabled:opacity-50"
										onPress={() => submitEdit(p.id)}
										disabled={!!isUpdating || !editPresenter.trim()}
									>
										<Text className="text-sm font-semibold text-background">
											{isUpdating ? "Saving..." : "Save"}
										</Text>
									</Pressable>
									<Pressable
										className="h-9 flex-1 items-center justify-center rounded-md border border-primary/40 bg-surface-inset"
										onPress={() => setEditingId(null)}
									>
										<Text className="text-sm font-semibold text-primary">
											Cancel
										</Text>
									</Pressable>
								</View>
							</View>
						) : (
							<View
								key={p.id}
								className="flex-row items-center gap-3 rounded-xl border border-primary/30 bg-card p-4"
							>
								<View className="flex-1 gap-0.5">
									<Text className="text-base font-semibold">
										{p.title || "Untitled"}
									</Text>
									<Text className="text-xs text-text-tertiary">
										{p.presenter}
									</Text>
								</View>
								<Pressable
									hitSlop={8}
									onPress={() => startEdit(p)}
									className="h-9 w-9 items-center justify-center rounded-md border border-primary/30 bg-surface-inset"
								>
									<Pencil size={16} color="#22D3EE" />
								</Pressable>
								<Pressable
									hitSlop={8}
									onPress={() => onDelete(p)}
									className="h-9 w-9 items-center justify-center rounded-md border border-destructive/30 bg-surface-inset"
								>
									<Trash2 size={16} color="#F87171" />
								</Pressable>
							</View>
						),
					)}
				</View>
			)}
		</View>
	)
}

export { PresentationsList }
