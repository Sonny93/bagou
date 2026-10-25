import { inject } from '@adonisjs/core';
import { Database } from '@adonisjs/lucid/database';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import type {
	PublicKeyCredentialCreationOptionsJSON,
	RegistrationResponseJSON,
} from '@simplewebauthn/server';

import Passkey from '#passkeys/passkey';
import {
	CEREMONIES,
	PasskeyChallengeService,
	type ChallengeStore,
} from '#passkeys/passkey_challenge_service';
import { PasskeyInvitationService } from '#passkeys/passkey_invitation_service';
import { PasskeyService } from '#passkeys/passkey_service';
import { WebauthnService } from '#passkeys/webauthn_service';
import type User from '#users/user';
import { UserService } from '#users/user_service';

type RegistrationInput = {
	owner: User;
	label: string;
	response: RegistrationResponseJSON;
	challenges: ChallengeStore;
};

type InvitationRegistrationInput = Omit<RegistrationInput, 'owner'> & {
	token: string;
};

@inject()
export class PasskeyRegistrationService {
	constructor(
		private readonly database: Database,
		private readonly webauthnService: WebauthnService,
		private readonly challengeService: PasskeyChallengeService,
		private readonly invitationService: PasskeyInvitationService,
		private readonly passkeyService: PasskeyService,
		private readonly userService: UserService
	) {}

	async createOptions(
		owner: User,
		challenges: ChallengeStore
	): Promise<PublicKeyCredentialCreationOptionsJSON> {
		const existingPasskeys = await this.passkeyService.listForUser(owner);
		const options = await this.webauthnService.createRegistrationOptions({
			userId: owner.id,
			excludedCredentials: existingPasskeys,
		});
		this.challengeService.remember(
			challenges,
			CEREMONIES.registration,
			options.challenge
		);
		return options;
	}

	async createOptionsWithInvitation(
		token: string,
		challenges: ChallengeStore
	): Promise<PublicKeyCredentialCreationOptionsJSON> {
		await this.invitationService.assertUsable(token);
		const owner = await this.userService.findOrCreateOwner();
		return this.createOptions(owner, challenges);
	}

	async register(input: Readonly<RegistrationInput>): Promise<Passkey> {
		return this.storeVerifiedPasskey(input);
	}

	/**
	 * Consumes the invitation and stores the passkey in one transaction, so a
	 * failed verification leaves the invitation usable.
	 * @returns The owner the passkey now belongs to.
	 */
	async registerWithInvitation({
		token,
		...input
	}: Readonly<InvitationRegistrationInput>): Promise<User> {
		const owner = await this.userService.findOrCreateOwner();
		await this.database.transaction(async (transaction) => {
			await this.invitationService.consume(token, transaction);
			await this.storeVerifiedPasskey({ ...input, owner }, transaction);
		});
		return owner;
	}

	private async storeVerifiedPasskey(
		{ owner, label, response, challenges }: Readonly<RegistrationInput>,
		transaction?: TransactionClientContract
	): Promise<Passkey> {
		const expectedChallenge = this.challengeService.consume(
			challenges,
			CEREMONIES.registration
		);
		const verified = await this.webauthnService.verifyRegistration({
			response,
			expectedChallenge,
		});
		return Passkey.create(
			{
				userId: owner.id,
				label,
				credentialId: verified.credentialId,
				publicKey: Buffer.from(verified.publicKey),
				counter: verified.counter,
				transports: verified.transports,
				deviceType: verified.deviceType,
				backedUp: verified.isBackedUp,
			},
			{ client: transaction }
		);
	}
}
