let _isDemoMode = false

export function isDemoMode(): boolean {
	return _isDemoMode
}

export function enterDemoMode() {
	_isDemoMode = true
}

export function exitDemoMode() {
	_isDemoMode = false
}
