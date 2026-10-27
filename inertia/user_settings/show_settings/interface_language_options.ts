import type { Data } from '@generated/data';
import type { I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type InterfaceLanguage = Data.UserSettings['interfaceLanguage'];

type InterfaceLanguageOption = {
	value: InterfaceLanguage;
	label: string;
};

const NATIVE_LANGUAGE_NAMES = {
	en: 'English',
	fr: 'Français',
} as const satisfies Record<Exclude<InterfaceLanguage, 'system'>, string>;

/** Each language is named in itself, only the system choice is translated. */
export function buildInterfaceLanguageOptions(
	languages: readonly InterfaceLanguage[],
	i18n: I18n
): InterfaceLanguageOption[] {
	return languages.map((value) => ({
		value,
		label:
			value === 'system'
				? i18n._(msg`System language`)
				: NATIVE_LANGUAGE_NAMES[value],
	}));
}
