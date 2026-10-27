import { router } from '@inertiajs/react';
import { useLingui } from '@lingui/react/macro';

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
	const { t } = useLingui();
	const goToDictation = () => router.visit(urlFor('dictation.show_dictation'));
	const { isRegistering, errorMessage, register } = usePasskeyRegistration(
		{ kind: 'invitation', token },
		goToDictation
	);

	return (
		<PasskeyCardPage
			title={t`Register a passkey`}
			intro={t`Give this passkey a name so you can recognize it later.`}
		>
			<PasskeyLabelForm
				submitLabel={t`Create the passkey`}
				isSubmitting={isRegistering}
				errorMessage={errorMessage}
				onSubmit={register}
			/>
		</PasskeyCardPage>
	);
}
