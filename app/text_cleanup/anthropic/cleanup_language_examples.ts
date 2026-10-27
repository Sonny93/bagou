import type { DictationLanguage } from '#shared/dictation_language';

type CleanupLanguageExamples = {
	languageName: string;
	fillers: string;
	selfCorrections: string;
};

export const CLEANUP_LANGUAGE_EXAMPLES: Readonly<
	Record<DictationLanguage, CleanupLanguageExamples>
> = {
	fr: {
		languageName: 'French',
		fillers: 'euh, hum, bah, ben, genre or du coup when used as fillers',
		selfCorrections: '"non, plutôt…", "enfin je veux dire…", "pardon…"',
	},
	en: {
		languageName: 'English',
		fillers: 'um, uh, er, like or you know when used as fillers',
		selfCorrections: '"no, I mean…", "sorry…", "actually…"',
	},
};
