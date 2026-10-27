import { useLingui } from '@lingui/react/macro';
import { Textarea } from '@minimalstuff/ui';
import type { ChangeEvent } from 'react';

const INSTRUCTIONS_ROWS = 5;

type CleanupInstructionsFieldProps = {
	value: string;
	maxLength: number;
	error: string | undefined;
	onChange: (value: string) => void;
};

export function CleanupInstructionsField({
	value,
	maxLength,
	error,
	onChange,
}: Readonly<CleanupInstructionsFieldProps>) {
	const { t } = useLingui();

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
		onChange(event.target.value);

	return (
		<Textarea
			label={t`Cleanup instructions`}
			description={t`Preferences for the cleanup, e.g. how to write numbers or quotes. They never make it rephrase your text.`}
			placeholder={t`Write numbers as digits.\nUse French quotation marks.`}
			rows={INSTRUCTIONS_ROWS}
			maxLength={maxLength}
			showCharCount
			value={value}
			error={error}
			onChange={handleChange}
		/>
	);
}
