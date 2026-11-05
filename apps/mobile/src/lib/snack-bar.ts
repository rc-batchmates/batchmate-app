import type { QueryClient } from "@tanstack/react-query"
import { api } from "./api"

// Production URL even in dev builds: the tag only identifies the SKU, and the
// app talks to whichever API it's configured for.
export const SNACK_TAG_ORIGIN = "https://batchmate.app"

export function snackTagUrl(skuId: string) {
	return `${SNACK_TAG_ORIGIN}/snack/${skuId}`
}

export function skuIdFromTagUrl(url: string): string | null {
	const match = /^https:\/\/batchmate\.app\/snack\/(sku_[0-9a-z]{26})\/?$/.exec(
		url,
	)
	return match?.[1] ?? null
}

export function invalidateSnackBar(queryClient: QueryClient) {
	return queryClient.invalidateQueries({ queryKey: api.key() })
}
