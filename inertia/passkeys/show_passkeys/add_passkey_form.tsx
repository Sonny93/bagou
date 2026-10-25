import { router } from '@inertiajs/react';

import { PasskeyLabelForm } from '~/passkeys/shared/passkey_label_form';
import { usePasskeyRegistration } from '~/passkeys/use_passkey_registration';

export function AddPasskeyForm() {
	const refreshPasskeys = () => router.reload({ only: ['passkeys'] });
	const { isRegistering, errorMessage, register } = usePasskeyRegistration(
		{ kind: 'owner' },
		refreshPasskeys
	);

	return (
		<PasskeyLabelForm
			submitLabel="Ajouter une passkey"
			isSubmitting={isRegistering}
			errorMessage={errorMessage}
			onSubmit={register}
		/>
	);
}
