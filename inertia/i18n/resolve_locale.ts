import type { Data } from '@generated/data';

import {
	isSupportedLocale,
	SOURCE_LOCALE,
	type Locale,
} from '~/i18n/supported_locales';

export type InterfaceLanguageSetting = NonNullable<
	Data.SharedProps['interfaceLanguage']
>;

const SYSTEM_LANGUAGE_SETTING = 'system' satisfies InterfaceLanguageSetting;

function toBaseLanguage(languageTag: string): string {
	return languageTag.split('-')[0].toLowerCase();
}

function findPreferredLocale(
	preferredLanguages: readonly string[]
): Locale | undefined {
	return preferredLanguages.map(toBaseLanguage).find(isSupportedLocale);
}

/**
 * The display locale for the interface language setting. An explicit choice
 * wins; `system` takes the first supported browser language, English otherwise.
 */
export function resolveLocale(
	setting: InterfaceLanguageSetting,
	preferredLanguages: readonly string[]
): Locale {
	if (setting !== SYSTEM_LANGUAGE_SETTING) return setting;
	return findPreferredLocale(preferredLanguages) ?? SOURCE_LOCALE;
}
