import type {
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';

import PasskeyAuthenticationFailedException from '#passkeys/passkey_authentication_failed_exception';
import PasskeyRegistrationFailedException from '#passkeys/passkey_registration_failed_exception';
import {
	WebauthnService,
	type VerifiedRegistration,
} from '#passkeys/webauthn_service';

export const FAKE_CHALLENGE = 'fake-challenge';
export const FAKE_CREDENTIAL_ID = 'fake-credential-id';
export const FAKE_NEW_COUNTER = 7;

const FAKE_VERIFIED_REGISTRATION: VerifiedRegistration = {
	credentialId: FAKE_CREDENTIAL_ID,
	publicKey: new Uint8Array([1, 2, 3]),
	counter: 0,
	transports: ['internal'],
	deviceType: 'multiDevice',
	isBackedUp: true,
};

type FakeWebauthnBehaviour = {
	isVerificationSuccessful: boolean;
};

/**
 * Stands in for the real library, which needs a real authenticator to verify
 * anything. Options carry a fixed challenge; verification succeeds or fails
 * according to the given behaviour.
 */
export class FakeWebauthnService extends WebauthnService {
	constructor(
		private readonly behaviour: Readonly<FakeWebauthnBehaviour> = {
			isVerificationSuccessful: true,
		}
	) {
		super();
	}

	override async createRegistrationOptions(): Promise<PublicKeyCredentialCreationOptionsJSON> {
		return {
			challenge: FAKE_CHALLENGE,
			rp: { name: 'Fake' },
			user: { id: 'fake-user-id', name: 'owner', displayName: 'Owner' },
			pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
		};
	}

	override async verifyRegistration(): Promise<VerifiedRegistration> {
		if (!this.behaviour.isVerificationSuccessful) {
			throw new PasskeyRegistrationFailedException();
		}
		return FAKE_VERIFIED_REGISTRATION;
	}

	override async createAuthenticationOptions(): Promise<PublicKeyCredentialRequestOptionsJSON> {
		return { challenge: FAKE_CHALLENGE };
	}

	override async verifyAuthentication(): Promise<number> {
		if (!this.behaviour.isVerificationSuccessful) {
			throw new PasskeyAuthenticationFailedException();
		}
		return FAKE_NEW_COUNTER;
	}
}
