import type { DictationLanguage } from '#shared/dictation_language';

export type OpenTranscriptionOptions = {
	language: DictationLanguage;
	vocabulary?: readonly string[];
};
