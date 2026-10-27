import type { SettingsLimits } from './settings_limits';

export type VocabularyProblem =
	| { kind: 'too_many_terms'; maxTermCount: number }
	| { kind: 'term_too_long'; maxTermLength: number };

/** The first limit the vocabulary breaks, `null` when it fits. */
export function findVocabularyProblem(
	terms: readonly string[],
	limits: Readonly<SettingsLimits>
): VocabularyProblem | null {
	if (terms.length > limits.maxVocabularyTerms) {
		return { kind: 'too_many_terms', maxTermCount: limits.maxVocabularyTerms };
	}
	if (terms.some((term) => term.length > limits.maxTermLength)) {
		return { kind: 'term_too_long', maxTermLength: limits.maxTermLength };
	}
	return null;
}
