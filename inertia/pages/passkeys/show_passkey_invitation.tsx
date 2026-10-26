import { router } from '@inertiajs/react';

import { PasskeyCardPage } from '~/passkeys/shared/passkey_card_page';
import { PasskeyLabelForm } from '~/passkeys/shared/passkey_label_form';
import { usePasskeyRegistration } from '~/passkeys/use_passkey_registration';
import { urlFor } from '~/shared/lib/url_for';

type ShowPasskeyInvitationProps = {
	token: string;
};

export default function ShowPasskeyInvitation({
	token,
}: Readonly<ShowPasskeyInvitationProps>) {
	const goToDictation = () => router.visit(urlFor('dictation.show_dictation'));
	const { isRegistering, errorMessage, register } = usePasskeyRegistration(
		{ kind: 'invitation', token },
		goToDictation
	);

	return (
		<PasskeyCardPage
			title="Enregistrer une passkey"
			intro="Donne un nom à cette passkey pour la reconnaître plus tard."
		>
			<PasskeyLabelForm
				submitLabel="Créer la passkey"
				isSubmitting={isRegistering}
				errorMessage={errorMessage}
				onSubmit={register}
			/>
		</PasskeyCardPage>
	);
}
