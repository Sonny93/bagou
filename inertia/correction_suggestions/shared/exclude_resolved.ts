import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { isSameCorrectionPair } from '~/dictation/core/is_same_correction_pair';

/** The suggestions the server sent minus the pairs the user already resolved, which an answer sent before that may still hold. */
export const excludeResolved = <TSuggestion extends CorrectionPair>(
	suggestions: readonly TSuggestion[],
	resolved: readonly CorrectionPair[]
): readonly TSuggestion[] =>
	suggestions.filter(
		(suggestion) =>
			!resolved.some((pair) => isSameCorrectionPair(pair, suggestion))
	);
