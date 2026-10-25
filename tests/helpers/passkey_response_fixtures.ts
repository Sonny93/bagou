import { FAKE_CREDENTIAL_ID } from '#tests/helpers/fake_webauthn_service';

export function buildRegistrationBody(label = 'MacBook') {
	return {
		label,
		response: {
			id: FAKE_CREDENTIAL_ID,
			rawId: FAKE_CREDENTIAL_ID,
			type: 'public-key',
			clientExtensionResults: {},
			response: {
				clientDataJSON: 'client-data',
				attestationObject: 'attestation',
				transports: ['internal'],
			},
		},
	};
}

export function buildAuthenticationBody(credentialId = FAKE_CREDENTIAL_ID) {
	return {
		response: {
			id: credentialId,
			rawId: credentialId,
			type: 'public-key',
			clientExtensionResults: {},
			response: {
				clientDataJSON: 'client-data',
				authenticatorData: 'authenticator-data',
				signature: 'signature',
			},
		},
	};
}
