import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useRef, useState } from 'react';

import { excludeResolved } from '~/correction_suggestions/shared/exclude_resolved';
import type { PendingSuggestion } from '~/correction_suggestions/shared/pending_suggestion';
import { requestPushSuggestions } from '~/correction_suggestions/shared/request_push_suggestions';
import {
	claimBatches,
	settleBatch,
	trackPairs,
	untrackPair,
	type PushBatch,
	type TrackedPair,
} from '~/correction_suggestions/shared/track_pushes';
import { describeCorrectionFailure } from '~/corrections/shared/describe_correction_failure';
import { readCorrectionFailure } from '~/corrections/shared/read_correction_failure';
import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { isSameCorrectionPair } from '~/dictation/core/is_same_correction_pair';
import { reportError } from '~/shared/errors/report_error';

const PUSH_BATCH_SIZE = 20;
const PUSH_FAILURE_TOAST_ID = 'push-correction-suggestions-failure';

type UsePushSuggestionsReturn = {
	pending: readonly PendingSuggestion[];
	pushPairs: (pairs: readonly CorrectionPair[], draftId: string) => void;
	pushPairsBeforeLeaving: (
		pairs: readonly CorrectionPair[],
		draftId: string
	) => void;
	forgetPair: (pair: CorrectionPair) => void;
	getIsPushing: () => boolean;
};

/**
 * Keeps the server's copy of the suggestions to review, and hands it the
 * corrections found in the drafts. A pair is sent once; one that failed
 * to go is sent again by the next push. What the server answers replaces the
 * pending suggestions held here. When the page props bring a newer list
 * (a reload), it replaces them too, minus what was resolved here since.
 */
export function usePushSuggestions(
	initialPending: readonly PendingSuggestion[]
): UsePushSuggestionsReturn {
	const { i18n } = useLingui();
	const [pending, setPending] = useState(initialPending);
	const trackedRef = useRef<readonly TrackedPair[]>([]);
	const resolvedRef = useRef<readonly CorrectionPair[]>([]);
	const inFlightCountRef = useRef(0);
	const syncedPendingRef = useRef(initialPending);

	useEffect(() => {
		if (syncedPendingRef.current === initialPending) return;
		syncedPendingRef.current = initialPending;
		setPending(excludeResolved(initialPending, resolvedRef.current));
	}, [initialPending]);

	const sendBatch = useCallback(
		async (batch: PushBatch, isPageLeaving: boolean) => {
			inFlightCountRef.current += 1;
			try {
				const latest = await requestPushSuggestions({
					...batch,
					isPageLeaving,
				});
				trackedRef.current = settleBatch(trackedRef.current, batch, 'sent');
				setPending(excludeResolved(latest, resolvedRef.current));
			} catch (error) {
				trackedRef.current = settleBatch(trackedRef.current, batch, 'waiting');
				const failure = readCorrectionFailure(error);
				reportError(describeCorrectionFailure(failure, i18n), error, {
					toastId: PUSH_FAILURE_TOAST_ID,
				});
			} finally {
				inFlightCountRef.current -= 1;
			}
		},
		[i18n]
	);

	const sendTracked = useCallback(
		async (isPageLeaving: boolean) => {
			const claim = claimBatches(trackedRef.current, PUSH_BATCH_SIZE);
			trackedRef.current = claim.tracked;
			await claim.batches.reduce(
				(previous, batch) =>
					previous.then(() => sendBatch(batch, isPageLeaving)),
				Promise.resolve()
			);
		},
		[sendBatch]
	);

	const pushPairs = useCallback(
		(pairs: readonly CorrectionPair[], draftId: string) => {
			trackedRef.current = trackPairs(trackedRef.current, pairs, draftId);
			void sendTracked(false);
		},
		[sendTracked]
	);

	const pushPairsBeforeLeaving = useCallback(
		(pairs: readonly CorrectionPair[], draftId: string) => {
			trackedRef.current = trackPairs(trackedRef.current, pairs, draftId);
			void sendTracked(true);
		},
		[sendTracked]
	);

	const forgetPair = useCallback((pair: CorrectionPair) => {
		trackedRef.current = untrackPair(trackedRef.current, pair);
		resolvedRef.current = [...resolvedRef.current, pair];
		setPending((current) =>
			current.filter((suggestion) => !isSameCorrectionPair(suggestion, pair))
		);
	}, []);

	const getIsPushing = useCallback(() => inFlightCountRef.current > 0, []);

	return {
		pending,
		pushPairs,
		pushPairsBeforeLeaving,
		forgetPair,
		getIsPushing,
	};
}
