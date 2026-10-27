import { useLingui } from '@lingui/react/macro';
import { Select } from '@minimalstuff/ui';
import type { ChangeEvent } from 'react';

import {
	buildDictationLanguageOptions,
	type DictationLanguage,
} from './dictation_language_options';

type DictationLanguageSelectProps = {
	value: DictationLanguage;
	languages: readonly DictationLanguage[];
	error: string | undefined;
	onChange: (value: DictationLanguage) => void;
};

export function DictationLanguageSelect({
	value,
	languages,
	error,
	onChange,
}: Readonly<DictationLanguageSelectProps>) {
	const { t, i18n } = useLingui();

	const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const selected = languages.find(
			(language) => language === event.target.value
		);
		if (selected !== undefined) onChange(selected);
	};

	return (
		<Select
			label={t`Dictation language`}
			description={t`The language you speak. It guides the speech engine and the cleanup.`}
			options={buildDictationLanguageOptions(languages, i18n)}
			value={value}
			error={error}
			onChange={handleChange}
		/>
	);
}
