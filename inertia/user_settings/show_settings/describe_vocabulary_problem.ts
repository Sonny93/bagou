import type { I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import type { VocabularyProblem } from './find_vocabulary_problem';

export function describeVocabularyProblem(
	problem: Readonly<VocabularyProblem>,
	i18n: I18n
): string {
	if (problem.kind === 'too_many_terms') {
		const { maxTermCount } = problem;
		return i18n._(msg`The vocabulary is limited to ${maxTermCount} terms`);
	}
	const { maxTermLength } = problem;
	return i18n._(msg`Each term is limited to ${maxTermLength} characters`);
}
