import { getPairKey } from '~/correction_suggestions/shared/get_pair_key';
import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { isSameCorrectionPair } from '~/dictation/core/is_same_correction_pair';

type PendingSuggestionLike = CorrectionPair & { readonly createdAt: string };

export type ReviewItem = CorrectionPair & {
	readonly key: string;
	readonly createdAt: string | null;
};

const fromPending = ({
	heard,
	written,
	createdAt,
}: Readonly<PendingSuggestionLike>): ReviewItem => ({
	key: getPairKey({ heard, written }),
	heard,
	written,
	createdAt,
});

const fromLocal = ({
	heard,
	written,
}: Readonly<CorrectionPair>): ReviewItem => ({
	key: getPairKey({ heard, written }),
	heard,
	written,
	createdAt: null,
});

/**
 * What the user has to review: the suggestions the server holds, newest
 * first as it sends them, then the pairs only this page has found so far.
 * A pair on both sides shows once, with the server's date.
 */
export function buildReviewList(
	pending: readonly PendingSuggestionLike[],
	localQueue: readonly CorrectionPair[]
): readonly ReviewItem[] {
	const items = pending.map(fromPending);
	for (const pair of localQueue) {
		const isListed = items.some((item) => isSameCorrectionPair(item, pair));
		if (!isListed) items.push(fromLocal(pair));
	}
	return items;
}
