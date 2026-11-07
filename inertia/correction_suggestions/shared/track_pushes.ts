import { chunkItems } from '~/correction_suggestions/shared/chunk_items';
import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { isSameCorrectionPair } from '~/dictation/core/is_same_correction_pair';

type PushStatus = 'waiting' | 'sending' | 'sent';

/** A pair found in the draft `draftId`, and how far it got towards the server. */
export type TrackedPair = {
	readonly pair: CorrectionPair;
	readonly draftId: string;
	readonly status: PushStatus;
};

export type PushBatch = {
	readonly draftId: string;
	readonly pairs: readonly CorrectionPair[];
};

const isTracking = (
	tracked: readonly TrackedPair[],
	pair: Readonly<CorrectionPair>
): boolean => tracked.some((entry) => isSameCorrectionPair(entry.pair, pair));

/** Starts following the pairs not followed yet, as waiting to be pushed with their draft. */
export const trackPairs = (
	tracked: readonly TrackedPair[],
	pairs: readonly CorrectionPair[],
	draftId: string
): readonly TrackedPair[] => {
	const added: TrackedPair[] = [];
	for (const pair of pairs) {
		if (isTracking([...tracked, ...added], pair)) continue;
		added.push({ pair, draftId, status: 'waiting' });
	}
	return added.length === 0 ? tracked : [...tracked, ...added];
};

/** Stops following a pair that was remembered or dismissed. */
export const untrackPair = (
	tracked: readonly TrackedPair[],
	pair: Readonly<CorrectionPair>
): readonly TrackedPair[] =>
	tracked.filter((entry) => !isSameCorrectionPair(entry.pair, pair));

const startSending = (entry: TrackedPair): TrackedPair =>
	entry.status === 'waiting' ? { ...entry, status: 'sending' } : entry;

/**
 * Takes the waiting pairs to send: they become `sending`, so a second push
 * started meanwhile does not send them again, and come back grouped by draft
 * in batches of at most `batchSize`.
 */
export function claimBatches(
	tracked: readonly TrackedPair[],
	batchSize: number
): { tracked: readonly TrackedPair[]; batches: readonly PushBatch[] } {
	const waiting = tracked.filter((entry) => entry.status === 'waiting');
	const draftIds = [...new Set(waiting.map((entry) => entry.draftId))];
	const batches = draftIds.flatMap((draftId) => {
		const pairs = waiting
			.filter((entry) => entry.draftId === draftId)
			.map((entry) => entry.pair);
		return chunkItems(pairs, batchSize).map((chunk) => ({
			draftId,
			pairs: chunk,
		}));
	});
	return { tracked: tracked.map(startSending), batches };
}

/** Moves the pairs of a batch on: `sent` once pushed, back to `waiting` when the push failed. */
export const settleBatch = (
	tracked: readonly TrackedPair[],
	batch: Readonly<PushBatch>,
	status: 'sent' | 'waiting'
): readonly TrackedPair[] =>
	tracked.map((entry) => {
		const isInBatch =
			entry.status === 'sending' &&
			entry.draftId === batch.draftId &&
			batch.pairs.some((pair) => isSameCorrectionPair(pair, entry.pair));
		return isInBatch ? { ...entry, status } : entry;
	});
