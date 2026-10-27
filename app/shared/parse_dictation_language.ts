import {
	DICTATION_LANGUAGES,
	type DictationLanguage,
} from '#shared/dictation_language';
import { UnknownDictationLanguageError } from '#shared/unknown_dictation_language_error';

/** Narrows a command line value to a dictation language, or throws `UnknownDictationLanguageError`. */
export function parseDictationLanguage(value: string): DictationLanguage {
	const language = DICTATION_LANGUAGES.find((candidate) => candidate === value);
	if (!language) throw new UnknownDictationLanguageError(value);
	return language;
}
