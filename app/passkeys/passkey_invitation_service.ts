import { inject } from '@adonisjs/core';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import { DateTime } from 'luxon';
import { createHash, randomBytes } from 'node:crypto';

import InvalidPasskeyInvitationException from '#passkeys/invalid_passkey_invitation_exception';
import PasskeyInvitation from '#passkeys/passkey_invitation';

export const INVITATION_TTL_MINUTES = 15;
const TOKEN_BYTE_LENGTH = 32;

export type CreatedInvitation = {
	token: string;
	expiresAt: DateTime;
};

const hashToken = (token: string): string =>
	createHash('sha256').update(token).digest('hex');

/**
 * Single-use, short-lived invitations that let the owner register a passkey.
 * Only the SHA-256 hash of a token is stored, never the token itself.
 */
@inject()
export class PasskeyInvitationService {
	async create(): Promise<CreatedInvitation> {
		const token = randomBytes(TOKEN_BYTE_LENGTH).toString('base64url');
		const expiresAt = DateTime.now().plus({ minutes: INVITATION_TTL_MINUTES });
		await PasskeyInvitation.create({ tokenHash: hashToken(token), expiresAt });
		return { token, expiresAt };
	}

	async assertUsable(token: string): Promise<void> {
		const invitation = await PasskeyInvitation.findBy(
			'tokenHash',
			hashToken(token)
		);
		const isUsable =
			invitation?.usedAt === null && invitation.expiresAt > DateTime.now();
		if (!isUsable) throw new InvalidPasskeyInvitationException();
	}

	/**
	 * Marks the invitation as used. The conditional update makes concurrent
	 * consumption of the same token succeed at most once.
	 */
	async consume(
		token: string,
		transaction: TransactionClientContract
	): Promise<void> {
		const now = DateTime.now();
		const [updatedCount] = await PasskeyInvitation.query({
			client: transaction,
		})
			.where('tokenHash', hashToken(token))
			.whereNull('usedAt')
			.where('expiresAt', '>', now.toJSDate())
			.update({ usedAt: now.toJSDate() });
		if (updatedCount === 0) throw new InvalidPasskeyInvitationException();
	}
}
