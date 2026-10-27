import { DICTATION_LANGUAGES } from '#shared/dictation_language';

export class UnknownDictationLanguageError extends Error {
	override readonly name = 'UnknownDictationLanguageError';
	readonly code = 'E_UNKNOWN_DICTATION_LANGUAGE';

	constructor(requestedLanguage: string) {
		super(
			`Unknown language "${requestedLanguage}". Known languages: ${DICTATION_LANGUAGES.join(', ')}`
		);
	}
}
