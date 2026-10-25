import { inject } from '@adonisjs/core';
import type {
	AuthenticationResponseJSON,
	PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';
import { DateTime } from 'luxon';

import LastPasskeyException from '#passkeys/last_passkey_exception';
import Passkey from '#passkeys/passkey';
import PasskeyAuthenticationFailedException from '#passkeys/passkey_authentication_failed_exception';
import {
	CEREMONIES,
	PasskeyChallengeService,
	type ChallengeStore,
} from '#passkeys/passkey_challenge_service';
import PasskeyNotFoundException from '#passkeys/passkey_not_found_exception';
import { WebauthnService } from '#passkeys/webauthn_service';
import User from '#users/user';

type AuthenticationInput = {
	response: AuthenticationResponseJSON;
	challenges: ChallengeStore;
};

@inject()
export class PasskeyService {
	constructor(
		private readonly webauthnService: WebauthnService,
		private readonly challengeService: PasskeyChallengeService
	) {}

	async listForUser(user: User): Promise<Passkey[]> {
		return Passkey.query().where('userId', user.id).orderBy('createdAt', 'asc');
	}

	async createAuthenticationOptions(
		challenges: ChallengeStore
	): Promise<PublicKeyCredentialRequestOptionsJSON> {
		const options = await this.webauthnService.createAuthenticationOptions();
		this.challengeService.remember(
			challenges,
			CEREMONIES.authentication,
			options.challenge
		);
		return options;
	}

	/**
	 * @returns The user owning the passkey that signed the challenge.
	 */
	async authenticate({
		response,
		challenges,
	}: Readonly<AuthenticationInput>): Promise<User> {
		const expectedChallenge = this.challengeService.consume(
			challenges,
			CEREMONIES.authentication
		);
		const passkey = await Passkey.findBy('credentialId', response.id);
		if (!passkey) throw new PasskeyAuthenticationFailedException();

		const newCounter = await this.webauthnService.verifyAuthentication({
			response,
			expectedChallenge,
			credential: {
				credentialId: passkey.credentialId,
				publicKey: passkey.publicKey,
				counter: passkey.counter,
				transports: passkey.transports,
			},
		});
		passkey.counter = newCounter;
		passkey.lastUsedAt = DateTime.now();
		await passkey.save();
		return User.findOrFail(passkey.userId);
	}

	async delete(user: User, passkeyId: number): Promise<void> {
		const passkeys = await this.listForUser(user);
		const passkeyToDelete = passkeys.find(({ id }) => id === passkeyId);
		if (!passkeyToDelete) throw new PasskeyNotFoundException();
		if (passkeys.length === 1) throw new LastPasskeyException();
		await passkeyToDelete.delete();
	}
}
