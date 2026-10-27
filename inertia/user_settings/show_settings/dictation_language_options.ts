import type { Data } from '@generated/data';
import type { I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { translateOptions } from '~/i18n/translate_options';

export type DictationLanguage = Data.UserSettings['dictationLanguage'];

const DICTATION_LANGUAGE_LABELS = {
	fr: msg`French`,
	en: msg`English`,
} as const satisfies Record<DictationLanguage, unknown>;

export function buildDictationLanguageOptions(
	languages: readonly DictationLanguage[],
	i18n: I18n
): { value: DictationLanguage; label: string }[] {
	return translateOptions(
		languages.map((value) => ({
			value,
			label: DICTATION_LANGUAGE_LABELS[value],
		})),
		i18n
	);
}
