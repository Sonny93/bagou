import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import PasskeyInvitation from '#passkeys/passkey_invitation';
import { PasskeyInvitationService } from '#passkeys/passkey_invitation_service';

test.group('ShowPasskeyInvitationController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should render the invitation page when the token is valid', async ({
		client,
		assert,
	}) => {
		const { token } = await new PasskeyInvitationService().create();

		const response = await client
			.get(`/passkeys/invitations/${token}`)
			.withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('passkeys/show_passkey_invitation');
		assert.equal(response.inertiaProps.token, token);
	});

	test('should return the same 404 for unknown, expired and used tokens', async ({
		client,
		assert,
	}) => {
		const service = new PasskeyInvitationService();
		const expired = await service.create();
		await PasskeyInvitation.query().update({
			expiresAt: DateTime.now().minus({ minutes: 1 }).toJSDate(),
		});
		const used = await service.create();
		await PasskeyInvitation.query()
			.where('expiresAt', '>', new Date())
			.update({ usedAt: new Date() });

		const bodies: string[] = [];
		for (const token of [expired.token, used.token, 'unknown-token']) {
			const response = await client
				.get(`/passkeys/invitations/${token}`)
				.header('accept', 'application/json');
			response.assertStatus(404);
			bodies.push(response.text());
		}

		assert.lengthOf(new Set(bodies), 1);
	});
});
