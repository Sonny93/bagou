import { useLingui } from '@lingui/react/macro';
import { Select } from '@minimalstuff/ui';
import type { ChangeEvent } from 'react';

import {
	buildInterfaceLanguageOptions,
	type InterfaceLanguage,
} from './interface_language_options';

type InterfaceLanguageSelectProps = {
	value: InterfaceLanguage;
	languages: readonly InterfaceLanguage[];
	error: string | undefined;
	onChange: (value: InterfaceLanguage) => void;
};

export function InterfaceLanguageSelect({
	value,
	languages,
	error,
	onChange,
}: Readonly<InterfaceLanguageSelectProps>) {
	const { t, i18n } = useLingui();

	const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const selected = languages.find(
			(language) => language === event.target.value
		);
		if (selected !== undefined) onChange(selected);
	};

	return (
		<Select
			label={t`Interface language`}
			options={buildInterfaceLanguageOptions(languages, i18n)}
			value={value}
			error={error}
			onChange={handleChange}
		/>
	);
}
