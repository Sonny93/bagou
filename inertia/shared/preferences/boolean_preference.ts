export type BooleanPreference = {
	storageKey: string;
	defaultValue: boolean;
};

const ENABLED_VALUE = 'true';
const DISABLED_VALUE = 'false';

const getDefaultStorage = (): Storage | null => {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
};

/**
 * Reads a per-device on/off setting; falls back to the preference's default
 * when storage is absent, blocked, empty or unparseable.
 */
export function readBooleanPreference(
	{ storageKey, defaultValue }: Readonly<BooleanPreference>,
	storage: Storage | null = getDefaultStorage()
): boolean {
	try {
		const storedValue = storage?.getItem(storageKey);
		if (storedValue === ENABLED_VALUE) return true;
		if (storedValue === DISABLED_VALUE) return false;
		return defaultValue;
	} catch {
		return defaultValue;
	}
}

/** Persists the setting; a storage failure is ignored because this convenience setting still works in memory. */
export function writeBooleanPreference(
	{ storageKey }: Readonly<BooleanPreference>,
	isEnabled: boolean,
	storage: Storage | null = getDefaultStorage()
): void {
	try {
		storage?.setItem(storageKey, isEnabled ? ENABLED_VALUE : DISABLED_VALUE);
	} catch {
		return;
	}
}
