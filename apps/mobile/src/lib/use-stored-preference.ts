import * as SecureStore from "expo-secure-store"
import { useEffect, useState } from "react"

export function useStoredPreference<T extends string>(
	key: string,
	defaultValue: T,
	allowedValues: readonly T[],
): [T, (value: T) => void] {
	const fullKey = `batchmate_preference_${key}`
	const [value, setValue] = useState<T>(defaultValue)

	useEffect(() => {
		const stored = SecureStore.getItem(fullKey)
		if (stored && allowedValues.some((allowed) => allowed === stored)) {
			setValue(stored as T)
		}
	}, [allowedValues, fullKey])

	function update(nextValue: T) {
		setValue(nextValue)
		SecureStore.setItem(fullKey, nextValue)
	}

	return [value, update]
}
