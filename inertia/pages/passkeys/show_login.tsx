import { useLingui } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';

import { PasskeyCardPage } from '~/passkeys/shared/passkey_card_page';
import { PasskeyErrorAlert } from '~/passkeys/shared/passkey_error_alert';
import { usePasskeyLogin } from '~/passkeys/use_passkey_login';

export default function ShowLogin() {
	const { t } = useLingui();
	const { isLoggingIn, errorMessage, login } = usePasskeyLogin();

	return (
		<PasskeyCardPage
			title={t`Sign in`}
			intro={t`Use a passkey registered on this device.`}
		>
			<PasskeyErrorAlert message={errorMessage} />
			<Button
				startIcon="i-tabler-fingerprint"
				fullWidth
				loading={isLoggingIn}
				onClick={login}
			>
				{t`Sign in with a passkey`}
			</Button>
		</PasskeyCardPage>
	);
}
