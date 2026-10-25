import { useState } from 'react';

import { describePasskeyError } from '~/passkeys/describe_passkey_error';
import {
	registerPasskey,
	type RegistrationTarget,
} from '~/passkeys/register_passkey';

type UsePasskeyRegistrationReturn = {
	isRegistering: boolean;
	errorMessage: string | null;
	register: (label: string) => void;
};

export function usePasskeyRegistration(
	target: RegistrationTarget,
	onRegistered: () => void
): UsePasskeyRegistrationReturn {
	const [isRegistering, setIsRegistering] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const performRegistration = async (label: string): Promise<void> => {
		setIsRegistering(true);
		setErrorMessage(null);
		try {
			await registerPasskey({ target, label });
			onRegistered();
		} catch (error) {
			setErrorMessage(describePasskeyError(error));
		} finally {
			setIsRegistering(false);
		}
	};

	const register = (label: string) => {
		void performRegistration(label);
	};

	return { isRegistering, errorMessage, register };
}
