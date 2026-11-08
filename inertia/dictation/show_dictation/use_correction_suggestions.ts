import { useCallback, useRef, useState } from 'react';

import type { CorrectionPair } from '~/dictation/core/correction_pair';
import {
	correctionSuggestionsReducer,
	createCorrectionSuggestions,
	type CorrectionSuggestions,
	type CorrectionSuggestionsEvent,
} from '~/dictation/core/correction_suggestions';
import { readDismissedCorrections } from '~/dictation/show_dictation/dismissed_corrections';
import type { UseDictationDraftReturn } from '~/dictation/show_dictation/use_dictation_draft';

type UseCorrectionSuggestionsOptions = {
	knownPairs: readonly CorrectionPair[];
	draft: Pick<
		UseDictationDraftReturn,
		'insert' | 'replace' | 'clear' | 'getText' | 'getContext'
	>;
	onFlushed: (pairs: readonly CorrectionPair[], draftId: string) => void;
};

type UseCorrectionSuggestionsReturn = {
	queue: readonly CorrectionPair[];
	getQueue: () => readonly CorrectionPair[];
	insert: (segment: string) => string;
	replace: (text: string) => string;
	clear: () => void;
	rebase: (text: string) => void;
	detectEdits: (text: string) => void;
	resolve: (pair: CorrectionPair) => void;
	learn: (pairs: readonly CorrectionPair[]) => void;
};

const createInitialSuggestions = (
	knownPairs: readonly CorrectionPair[]
): CorrectionSuggestions =>
	createCorrectionSuggestions([
		...knownPairs.map(({ heard, written }) => ({ heard, written })),
		...readDismissedCorrections(),
	]);

/**
 * Finds the misheard words the user fixed by hand in the draft. The draft
 * actions it returns are the ones to use instead of the draft's own: each
 * takes the hand edits into the queue before the text stops being the user's
 * own and becomes the new baseline (a dictated segment, the cleaned text, the
 * other version, an empty draft), and hands the queue to `onFlushed` with the
 * id of the draft it comes from. `detectEdits` is for the edits in between.
 * `knownPairs` (remembered, dismissed, already waiting on the server) are
 * never suggested; `learn` adds pairs that became known later.
 */
export function useCorrectionSuggestions({
	knownPairs,
	draft,
	onFlushed,
}: Readonly<UseCorrectionSuggestionsOptions>): UseCorrectionSuggestionsReturn {
	const [suggestions, setSuggestions] = useState(() =>
		createInitialSuggestions(knownPairs)
	);
	const suggestionsRef = useRef(suggestions);
	const { insert, replace, clear, getText, getContext } = draft;

	const dispatch = useCallback((event: CorrectionSuggestionsEvent) => {
		const next = correctionSuggestionsReducer(suggestionsRef.current, event);
		suggestionsRef.current = next;
		setSuggestions(next);
		return next;
	}, []);

	const rebaseTo = useCallback(
		(currentText: string, baseline: string) => {
			const { draftId } = getContext();
			const next = dispatch({ type: 'rebased', currentText, baseline });
			onFlushed(next.flushed, draftId);
		},
		[dispatch, getContext, onFlushed]
	);

	const rebase = useCallback(
		(baseline: string) => rebaseTo(getText(), baseline),
		[rebaseTo, getText]
	);

	const insertSegment = useCallback(
		(segment: string) => {
			const currentText = getText();
			const baseline = insert(segment);
			rebaseTo(currentText, baseline);
			return baseline;
		},
		[getText, insert, rebaseTo]
	);

	const replaceText = useCallback(
		(text: string) => {
			rebase(text);
			return replace(text);
		},
		[rebase, replace]
	);

	const clearText = useCallback(() => {
		rebase('');
		clear();
	}, [rebase, clear]);

	const detectEdits = useCallback(
		(currentText: string) => void dispatch({ type: 'edited', currentText }),
		[dispatch]
	);

	const resolve = useCallback(
		(pair: CorrectionPair) => void dispatch({ type: 'resolved', pair }),
		[dispatch]
	);

	const learn = useCallback(
		(pairs: readonly CorrectionPair[]) =>
			void dispatch({ type: 'learned', pairs }),
		[dispatch]
	);

	const getQueue = useCallback(() => suggestionsRef.current.queue, []);

	return {
		queue: suggestions.queue,
		getQueue,
		insert: insertSegment,
		replace: replaceText,
		clear: clearText,
		rebase,
		detectEdits,
		resolve,
		learn,
	};
}
