import { useLingui } from '@lingui/react/macro';
import { Button, Input } from '@minimalstuff/ui';
import { useState, type ChangeEvent, type SubmitEvent } from 'react';

import { PasskeyErrorAlert } from '~/passkeys/shared/passkey_error_alert';

const MAX_LABEL_LENGTH = 60;

type PasskeyLabelFormProps = {
	submitLabel: string;
	isSubmitting: boolean;
	errorMessage: string | null;
	onSubmit: (label: string) => void;
};

export function PasskeyLabelForm({
	submitLabel,
	isSubmitting,
	errorMessage,
	onSubmit,
}: Readonly<PasskeyLabelFormProps>) {
	const { t } = useLingui();
	const [label, setLabel] = useState('');

	const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
		setLabel(event.target.value);

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSubmit(label.trim());
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<Input
				label={t`Passkey name`}
				placeholder={t`E.g. MacBook, phone`}
				value={label}
				maxLength={MAX_LABEL_LENGTH}
				required
				onChange={handleChange}
			/>
			<PasskeyErrorAlert message={errorMessage} />
			<Button type="submit" fullWidth loading={isSubmitting}>
				{submitLabel}
			</Button>
		</form>
	);
}
