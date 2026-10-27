const VOCABULARY_FIELD = 'vocabulary';
const VOCABULARY_ITEM_PREFIX = `${VOCABULARY_FIELD}.`;

/**
 * The rule name of the first vocabulary error: the list itself (`vocabulary`)
 * or one of its terms (`vocabulary.0`, `vocabulary.1`...).
 */
export function pickVocabularyError(
	errors: Readonly<Record<string, string>>
): string | undefined {
	const errorField = Object.keys(errors).find(
		(field) =>
			field === VOCABULARY_FIELD || field.startsWith(VOCABULARY_ITEM_PREFIX)
	);
	return errorField === undefined ? undefined : errors[errorField];
}
