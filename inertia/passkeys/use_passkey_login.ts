import { router } from '@inertiajs/react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useState } from 'react';

import { describePasskeyError } from '~/passkeys/describe_passkey_error';
import { tuyauClient } from '~/shared/lib/tuyau_client';
import { urlFor } from '~/shared/lib/url_for';

type UsePasskeyLoginReturn = {
	isLoggingIn: boolean;
	errorMessage: string | null;
	login: () => void;
};

export function usePasskeyLogin(): UsePasskeyLoginReturn {
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const performLogin = async (): Promise<void> => {
		setIsLoggingIn(true);
		setErrorMessage(null);
		try {
			const optionsJSON = await tuyauClient.request(
				'passkeys.create_authentication_options',
				{}
			);
			const response = await startAuthentication({ optionsJSON });
			await tuyauClient.request('passkeys.verify_authentication', {
				body: { response },
			});
			router.visit(urlFor('dictation.show_dictation'));
		} catch (error) {
			setErrorMessage(describePasskeyError(error));
			setIsLoggingIn(false);
		}
	};

	const login = () => {
		void performLogin();
	};

	return { isLoggingIn, errorMessage, login };
}
