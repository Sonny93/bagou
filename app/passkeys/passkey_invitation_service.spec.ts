import testUtils from '@adonisjs/core/services/test_utils';
import db from '@adonisjs/lucid/services/db';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';
import { createHash } from 'node:crypto';

import PasskeyInvitation from '#passkeys/passkey_invitation';
import {
	INVITATION_TTL_MINUTES,
	PasskeyInvitationService,
} from '#passkeys/passkey_invitation_service';

const sha256 = (value: string): string =>
	createHash('sha256').update(value).digest('hex');

test.group('PasskeyInvitationService', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should store only the hash of the token and expire it after the time to live', async ({
		assert,
	}) => {
		const service = new PasskeyInvitationService();

		const { token, expiresAt } = await service.create();

		const invitation = await PasskeyInvitation.firstOrFail();
		assert.equal(invitation.tokenHash, sha256(token));
		assert.notInclude(invitation.tokenHash, token);
		assert.match(token, /^[A-Za-z0-9_-]{43}$/);
		const minutesToLive = expiresAt.diffNow('minutes').minutes;
		assert.closeTo(minutesToLive, INVITATION_TTL_MINUTES, 0.1);
	});

	test('should accept a fresh token and reject an unknown one', async ({
		assert,
	}) => {
		const service = new PasskeyInvitationService();
		const { token } = await service.create();

		await service.assertUsable(token);

		await assert.rejects(
			() => service.assertUsable('unknown-token'),
			/invalid/
		);
	});

	test('should reject an expired token', async ({ assert }) => {
		const service = new PasskeyInvitationService();
		const { token } = await service.create();
		await PasskeyInvitation.query().update({
			expiresAt: DateTime.now().minus({ seconds: 1 }).toJSDate(),
		});

		await assert.rejects(() => service.assertUsable(token), /invalid/);
	});

	test('should consume a token only once', async ({ assert }) => {
		const service = new PasskeyInvitationService();
		const { token } = await service.create();
		const transaction = await db.transaction();

		await service.consume(token, transaction);
		const secondConsumption = service.consume(token, transaction);

		await assert.rejects(() => secondConsumption, /invalid/);
		await transaction.rollback();
	});
});
