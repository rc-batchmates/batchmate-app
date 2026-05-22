import AsyncStorage from "@react-native-async-storage/async-storage"

const cache = new Map<string, unknown>()
const hydrated = new Set<string>()

export async function hydrate(keys: string[]): Promise<void> {
	const pairs = await AsyncStorage.multiGet(keys)
	for (const [key, raw] of pairs) {
		if (raw != null) {
			try {
				cache.set(key, JSON.parse(raw))
			} catch {
				// ignore corrupted entries
			}
		}
		hydrated.add(key)
	}
}

export function readSync<T>(key: string, fallback: T): T {
	if (!hydrated.has(key)) return fallback
	return (cache.get(key) as T) ?? fallback
}

export function write(key: string, value: unknown): void {
	cache.set(key, value)
	hydrated.add(key)
	AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {
		// quota / disabled — silently ignore, mirrors web behaviour
	})
}

export function remove(key: string): void {
	cache.delete(key)
	AsyncStorage.removeItem(key).catch(() => {})
}
