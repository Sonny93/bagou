import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { isSameCorrectionPair } from '~/dictation/core/is_same_correction_pair';

const STORAGE_KEY = 'bagou:dismissed-corrections';
export const MAX_DISMISSED_CORRECTIONS = 200;

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

/** Reads the pairs dismissed on this device, oldest first; empty when storage is absent, blocked or unparseable. */
export function readDismissedCorrections(
	storage: Storage | null = getDefaultStorage()
): readonly CorrectionPair[] {
	try {
		return parsePairs(storage?.getItem(STORAGE_KEY));
	} catch {
		return [];
	}
}

/**
 * Remembers a dismissed pair on this device, dropping the oldest ones beyond
 * `MAX_DISMISSED_CORRECTIONS`. A storage failure is ignored: the dismissal
 * then only lasts until the page is closed.
 */
export function appendDismissedCorrection(
	pair: Readonly<CorrectionPair>,
	storage: Storage | null = getDefaultStorage()
): void {
	try {
		const others = readDismissedCorrections(storage).filter(
			(known) => !isSameCorrectionPair(known, pair)
		);
		const kept = [...others, pair].slice(-MAX_DISMISSED_CORRECTIONS);
		storage?.setItem(STORAGE_KEY, JSON.stringify(kept));
	} catch {
		return;
	}
}
