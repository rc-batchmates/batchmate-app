import { useEffect, useState } from "react"

export function useStoredPreference<T extends string>(
	key: string,
	defaultValue: T,
	allowedValues: readonly T[],
): [T, (value: T) => void] {
	const fullKey = `batchmate:preference:${key}`
	const [value, setValue] = useState<T>(defaultValue)

	useEffect(() => {
		const stored = localStorage.getItem(fullKey)
		if (stored && allowedValues.some((allowed) => allowed === stored)) {
			setValue(stored as T)
		}
	}, [allowedValues, fullKey])

	function update(nextValue: T) {
		setValue(nextValue)
		localStorage.setItem(fullKey, nextValue)
	}

	return [value, update]
}
