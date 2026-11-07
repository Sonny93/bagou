import type { CorrectionPair } from '~/dictation/core/correction_pair';

const STORAGE_KEY = 'bagou:dismissed-corrections';

const getDefaultStorage = (): Storage | null => {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
};

const isCorrectionPair = (value: unknown): value is CorrectionPair =>
	typeof value === 'object' &&
	value !== null &&
	'heard' in value &&
	typeof value.heard === 'string' &&
	'written' in value &&
	typeof value.written === 'string';

const parsePairs = (
	serialized: string | null | undefined
): CorrectionPair[] => {
	if (!serialized) return [];
	const parsed: unknown = JSON.parse(serialized);
	if (!Array.isArray(parsed)) return [];
	return parsed
		.filter(isCorrectionPair)
		.map(({ heard, written }) => ({ heard, written }));
};

/** Reads the pairs dismissed on this device before dismissals went to the server, oldest first; empty when storage is absent, blocked or unparseable. */
export function readDismissedCorrections(
	storage: Storage | null = getDefaultStorage()
): readonly CorrectionPair[] {
	try {
		return parsePairs(storage?.getItem(STORAGE_KEY));
	} catch {
		return [];
	}
}

/** Forgets the pairs dismissed on this device, once the server holds them. A storage failure is ignored. */
export function clearDismissedCorrections(
	storage: Storage | null = getDefaultStorage()
): void {
	try {
		storage?.removeItem(STORAGE_KEY);
	} catch {
		return;
	}
}
