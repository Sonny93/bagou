const AUTO_START_STORAGE_KEY = 'bagou:dictation:auto-start';
const ENABLED_VALUE = 'true';
const DISABLED_VALUE = 'false';

const getDefaultStorage = (): Storage | null => {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
};

/** Reads the per-device auto-start setting; defaults to false when storage is absent, blocked or unparseable. */
export function readAutoStartPreference(
	storage: Storage | null = getDefaultStorage()
): boolean {
	try {
		return storage?.getItem(AUTO_START_STORAGE_KEY) === ENABLED_VALUE;
	} catch {
		return false;
	}
}

/** Persists the setting; a storage failure is ignored because this convenience setting still works in memory. */
export function writeAutoStartPreference(
	isEnabled: boolean,
	storage: Storage | null = getDefaultStorage()
): void {
	try {
		storage?.setItem(
			AUTO_START_STORAGE_KEY,
			isEnabled ? ENABLED_VALUE : DISABLED_VALUE
		);
	} catch {
		return;
	}
}
