import { Trans, useLingui } from '@lingui/react/macro';
import { Textarea } from '@minimalstuff/ui';
import type { ChangeEvent } from 'react';

const VOCABULARY_ROWS = 6;

type VocabularyFieldProps = {
	value: string;
	termCount: number;
	maxTermCount: number;
	error: string | undefined;
	onChange: (value: string) => void;
};

export function VocabularyField({
	value,
	termCount,
	maxTermCount,
	error,
	onChange,
}: Readonly<VocabularyFieldProps>) {
	const { t } = useLingui();

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
		onChange(event.target.value);

	return (
		<div className="flex flex-col gap-1.5">
			<Textarea
				label={t`Vocabulary`}
				description={t`One term per line. It helps the speech engine and the cleanup spell names, products and jargon correctly.`}
				placeholder={t`Adonis\nInertia\nVoxtral`}
				rows={VOCABULARY_ROWS}
				value={value}
				error={error}
				onChange={handleChange}
			/>
			<p className="text-sm text-muted tabular-nums">
				<Trans>
					{termCount} of {maxTermCount} terms
				</Trans>
			</p>
		</div>
	);
}
