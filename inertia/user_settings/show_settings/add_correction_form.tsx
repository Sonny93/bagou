import { Trans, useLingui } from '@lingui/react/macro';
import { Button, Input } from '@minimalstuff/ui';
import { useRef, type ChangeEvent, type SubmitEvent } from 'react';

import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { useAddCorrectionForm } from '~/user_settings/show_settings/use_add_correction_form';

type AddCorrectionFormProps = {
	maxSideLength: number;
	onAdded: (pair: CorrectionPair) => void;
};

export function AddCorrectionForm({
	maxSideLength,
	onAdded,
}: Readonly<AddCorrectionFormProps>) {
	const { t } = useLingui();
	const heardRef = useRef<HTMLInputElement>(null);
	const writtenRef = useRef<HTMLInputElement>(null);
	const form = useAddCorrectionForm({
		maxSideLength,
		heardRef,
		writtenRef,
		onAdded,
	});

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		void form.submit();
	};
	const handleHeardChange = (event: ChangeEvent<HTMLInputElement>) =>
		form.setHeard(event.target.value);
	const handleWrittenChange = (event: ChangeEvent<HTMLInputElement>) =>
		form.setWritten(event.target.value);

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<Input
				ref={heardRef}
				label={t`What was heard`}
				placeholder={t`vox trale`}
				value={form.heard}
				maxLength={maxSideLength}
				error={form.fieldErrors.heard}
				onChange={handleHeardChange}
			/>
			<Input
				ref={writtenRef}
				label={t`What it should be`}
				placeholder={t`Voxtral`}
				value={form.written}
				maxLength={maxSideLength}
				error={form.fieldErrors.written}
				onChange={handleWrittenChange}
			/>
			{form.formError !== undefined && (
				<p role="alert" className="text-sm">
					{form.formError}
				</p>
			)}
			<div>
				<Button type="submit" loading={form.isSubmitting}>
					<Trans>Add correction</Trans>
				</Button>
			</div>
		</form>
	);
}
