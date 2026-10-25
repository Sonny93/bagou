import { inject } from '@adonisjs/core';
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	type AuthenticationResponseJSON,
	type PublicKeyCredentialCreationOptionsJSON,
	type PublicKeyCredentialRequestOptionsJSON,
	type RegistrationResponseJSON,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from '@simplewebauthn/server';

import PasskeyAuthenticationFailedException from '#passkeys/passkey_authentication_failed_exception';
import PasskeyRegistrationFailedException from '#passkeys/passkey_registration_failed_exception';
import env from '#start/env';

const RELYING_PARTY_NAME = 'Dictée vocale';
const OWNER_USER_NAME = 'owner';

type CredentialDescriptor = {
	credentialId: string;
	transports: string[];
};

type StoredCredential = CredentialDescriptor & {
	publicKey: Uint8Array;
	counter: number;
};

export type VerifiedRegistration = StoredCredential & {
	deviceType: string;
	isBackedUp: boolean;
};

type RegistrationOptionsInput = {
	userId: number;
	excludedCredentials: readonly CredentialDescriptor[];
};

type VerifyRegistrationInput = {
	response: RegistrationResponseJSON;
	expectedChallenge: string;
};

type VerifyAuthenticationInput = {
	response: AuthenticationResponseJSON;
	expectedChallenge: string;
	credential: StoredCredential;
};

/**
 * Single seam over @simplewebauthn/server: the relying party is derived from
 * APP_URL, and every library failure is converted to a typed exception.
 * Functional tests swap this service with a fake, since real verification
 * needs a real authenticator.
 */
@inject()
export class WebauthnService {
	createRegistrationOptions({
		userId,
		excludedCredentials,
	}: Readonly<RegistrationOptionsInput>): Promise<PublicKeyCredentialCreationOptionsJSON> {
		return generateRegistrationOptions({
			rpName: RELYING_PARTY_NAME,
			rpID: this.relyingPartyId,
			userName: OWNER_USER_NAME,
			userDisplayName: RELYING_PARTY_NAME,
			userID: new TextEncoder().encode(String(userId)),
			attestationType: 'none',
			excludeCredentials: excludedCredentials.map((credential) => ({
				id: credential.credentialId,
				transports: credential.transports,
			})),
			authenticatorSelection: {
				residentKey: 'required',
				userVerification: 'required',
			},
		});
	}

	async verifyRegistration({
		response,
		expectedChallenge,
	}: Readonly<VerifyRegistrationInput>): Promise<VerifiedRegistration> {
		try {
			const verification = await verifyRegistrationResponse({
				response,
				expectedChallenge,
				expectedOrigin: this.expectedOrigin,
				expectedRPID: this.relyingPartyId,
				requireUserVerification: true,
			});
			if (!verification.verified) {
				throw new PasskeyRegistrationFailedException();
			}
			const { credential, credentialDeviceType, credentialBackedUp } =
				verification.registrationInfo;
			return {
				credentialId: credential.id,
				publicKey: credential.publicKey,
				counter: credential.counter,
				transports: credential.transports ?? [],
				deviceType: credentialDeviceType,
				isBackedUp: credentialBackedUp,
			};
		} catch (error) {
			if (error instanceof PasskeyRegistrationFailedException) throw error;
			throw new PasskeyRegistrationFailedException({ cause: error });
		}
	}

	createAuthenticationOptions(): Promise<PublicKeyCredentialRequestOptionsJSON> {
		return generateAuthenticationOptions({
			rpID: this.relyingPartyId,
			userVerification: 'required',
		});
	}

	/**
	 * @returns The new signature counter reported by the authenticator.
	 */
	async verifyAuthentication({
		response,
		expectedChallenge,
		credential,
	}: Readonly<VerifyAuthenticationInput>): Promise<number> {
		try {
			const verification = await verifyAuthenticationResponse({
				response,
				expectedChallenge,
				expectedOrigin: this.expectedOrigin,
				expectedRPID: this.relyingPartyId,
				requireUserVerification: true,
				credential: {
					id: credential.credentialId,
					publicKey: new Uint8Array(credential.publicKey),
					counter: credential.counter,
					transports: credential.transports,
				},
			});
			if (!verification.verified) {
				throw new PasskeyAuthenticationFailedException();
			}
			return verification.authenticationInfo.newCounter;
		} catch (error) {
			if (error instanceof PasskeyAuthenticationFailedException) throw error;
			throw new PasskeyAuthenticationFailedException({ cause: error });
		}
	}

	protected get relyingPartyId(): string {
		return new URL(env.get('APP_URL')).hostname;
	}

	protected get expectedOrigin(): string {
		return new URL(env.get('APP_URL')).origin;
	}
}
