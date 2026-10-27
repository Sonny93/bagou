export const INTERFACE_LANGUAGES = ['system', 'en', 'fr'] as const;

export type InterfaceLanguage = (typeof INTERFACE_LANGUAGES)[number];
