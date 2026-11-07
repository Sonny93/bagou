import type { Data } from '@generated/data';
import { useCallback, useMemo } from 'react';

import {
	buildReviewList,
	type ReviewItem,
} from '~/correction_suggestions/shared/build_review_list';
import { useImportDismissedCorrections } from '~/correction_suggestions/show_dictation/use_import_dismissed_corrections';
import { usePushSuggestions } from '~/correction_suggestions/show_dictation/use_push_suggestions';
import { usePushWhenHidden } from '~/correction_suggestions/show_dictation/use_push_when_hidden';
import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { useCorrectionSuggestions } from '~/dictation/show_dictation/use_correction_suggestions';
import type { UseDictationDraftReturn } from '~/dictation/show_dictation/use_dictation_draft';

type UseCorrectionReviewOptions = {
	corrections: readonly CorrectionPair[];
	dismissedSuggestions: readonly CorrectionPair[];
	pendingSuggestions: readonly Data.CorrectionSuggestions.CorrectionSuggestion[];
	draft: Pick<
		UseDictationDraftReturn,
		'insert' | 'replace' | 'clear' | 'getText' | 'getContext'
	>;
};

type UseCorrectionReviewReturn = {
	suggestions: ReturnType<typeof useCorrectionSuggestions>;
	reviewItems: readonly ReviewItem[];
	resolve: (pair: CorrectionPair) => void;
};

/**
 * Ties the corrections found in the draft to the ones the server holds: the
 * pairs found are pushed at the stable points, the old browser-side
 * dismissals are sent once, and the list to review merges both sides.
 */
export function useCorrectionReview({
	corrections,
	dismissedSuggestions,
	pendingSuggestions,
	draft,
}: Readonly<UseCorrectionReviewOptions>): UseCorrectionReviewReturn {
	const { pending, pushPairs, pushPairsBeforeLeaving, forgetPair } =
		usePushSuggestions(pendingSuggestions);
	const suggestions = useCorrectionSuggestions({
		knownPairs: [
			...corrections,
			...dismissedSuggestions,
			...pendingSuggestions,
		],
		draft,
		onFlushed: pushPairs,
	});
	const { getContext } = draft;
	const { getQueue, resolve: resolveLocally } = suggestions;

	const getDraftId = useCallback(() => getContext().draftId, [getContext]);
	usePushWhenHidden({ getQueue, getDraftId, pushPairsBeforeLeaving });
	useImportDismissedCorrections();

	const reviewItems = useMemo(
		() => buildReviewList(pending, suggestions.queue),
		[pending, suggestions.queue]
	);

	const resolve = useCallback(
		(pair: CorrectionPair) => {
			resolveLocally(pair);
			forgetPair(pair);
		},
		[resolveLocally, forgetPair]
	);

	return { suggestions, reviewItems, resolve };
}
