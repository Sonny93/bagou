import { Button } from '@minimalstuff/ui';

import { PasskeyCardPage } from '~/passkeys/shared/passkey_card_page';
import { PasskeyErrorAlert } from '~/passkeys/shared/passkey_error_alert';
import { usePasskeyLogin } from '~/passkeys/use_passkey_login';

export default function ShowLogin() {
	const { isLoggingIn, errorMessage, login } = usePasskeyLogin();

	return (
		<PasskeyCardPage
			title="Connexion"
			intro="Utilise une passkey enregistrée sur cet appareil."
		>
			<PasskeyErrorAlert message={errorMessage} />
			<Button
				startIcon="i-tabler-fingerprint"
				fullWidth
				loading={isLoggingIn}
				onClick={login}
			>
				Se connecter avec une passkey
			</Button>
		</PasskeyCardPage>
	);
}
