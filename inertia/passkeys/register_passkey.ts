import { startRegistration } from '@simplewebauthn/browser';

import { tuyauClient } from '~/shared/lib/tuyau_client';

export type RegistrationTarget =
	| { kind: 'owner' }
	| { kind: 'invitation'; token: string };

type RegisterPasskeyInput = {
	target: RegistrationTarget;
	label: string;
};

/**
 * Runs the whole registration ceremony: ask the server for options, let the
 * authenticator create the credential, send the result back for verification.
 */
export async function registerPasskey({
	target,
	label,
}: Readonly<RegisterPasskeyInput>): Promise<void> {
	if (target.kind === 'invitation') {
		const params = { token: target.token };
		const optionsJSON = await tuyauClient.request(
			'passkeys.create_invitation_options',
			{ params }
		);
		const response = await startRegistration({ optionsJSON });
		await tuyauClient.request('passkeys.verify_invitation', {
			params,
			body: { label, response },
		});
		return;
	}

	const optionsJSON = await tuyauClient.request(
		'passkeys.create_registration_options',
		{}
	);
	const response = await startRegistration({ optionsJSON });
	await tuyauClient.request('passkeys.verify_registration', {
		body: { label, response },
	});
}
