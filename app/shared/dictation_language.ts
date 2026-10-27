export const DICTATION_LANGUAGES = ['fr', 'en'] as const;

export type DictationLanguage = (typeof DICTATION_LANGUAGES)[number];
