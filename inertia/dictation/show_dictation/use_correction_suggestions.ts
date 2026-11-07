import { useCallback, useReducer } from 'react';

import type { CorrectionPair } from '~/dictation/core/correction_pair';
import {
	correctionSuggestionsReducer,
	createCorrectionSuggestions,
	type CorrectionSuggestions,
} from '~/dictation/core/correction_suggestions';
import {
	appendDismissedCorrection,
	readDismissedCorrections,
} from '~/dictation/show_dictation/dismissed_corrections';
import type { UseDictationDraftReturn } from '~/dictation/show_dictation/use_dictation_draft';

type UseCorrectionSuggestionsOptions = {
	corrections: readonly CorrectionPair[];
	draft: Pick<
		UseDictationDraftReturn,
		'insert' | 'replace' | 'clear' | 'getText'
	>;
};

type UseCorrectionSuggestionsReturn = {
	queue: readonly CorrectionPair[];
	insert: (segment: string) => string;
	replace: (text: string) => string;
	clear: () => void;
	rebase: (text: string) => void;
	detectEdits: (text: string) => void;
	resolve: (pair: CorrectionPair) => void;
	dismiss: (pair: CorrectionPair) => void;
};

const createInitialSuggestions = (
	corrections: readonly CorrectionPair[]
): CorrectionSuggestions =>
	createCorrectionSuggestions([
		...corrections.map(({ heard, written }) => ({ heard, written })),
		...readDismissedCorrections(),
	]);

/**
 * Finds the misheard words the user fixed by hand in the draft. The draft
 * actions it returns are the ones to use instead of the draft's own: each
 * takes the hand edits into the queue before the text stops being the user's
 * own and becomes the new baseline (a dictated segment, the cleaned text, the
 * other version, an empty draft). `detectEdits` is for the edits in between.
 */
export function useCorrectionSuggestions({
	corrections,
	draft,
}: Readonly<UseCorrectionSuggestionsOptions>): UseCorrectionSuggestionsReturn {
	const [suggestions, dispatch] = useReducer(
		correctionSuggestionsReducer,
		corrections,
		createInitialSuggestions
	);
	const { insert, replace, clear, getText } = draft;

	const rebase = useCallback(
		(baseline: string) =>
			dispatch({ type: 'rebased', currentText: getText(), baseline }),
		[getText]
	);

	const insertSegment = useCallback(
		(segment: string) => {
			const currentText = getText();
			const baseline = insert(segment);
			dispatch({ type: 'rebased', currentText, baseline });
			return baseline;
		},
		[getText, insert]
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
		(currentText: string) => dispatch({ type: 'edited', currentText }),
		[]
	);

	const resolve = useCallback(
		(pair: CorrectionPair) => dispatch({ type: 'resolved', pair }),
		[]
	);

	const dismiss = useCallback(
		(pair: CorrectionPair) => {
			appendDismissedCorrection(pair);
			resolve(pair);
		},
		[resolve]
	);

	return {
		queue: suggestions.queue,
		insert: insertSegment,
		replace: replaceText,
		clear: clearText,
		rebase,
		detectEdits,
		resolve,
		dismiss,
	};
}
