import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { PasskeyInvitationService } from '#passkeys/passkey_invitation_service';
import { swapWebauthnService } from '#tests/helpers/swap_webauthn_service';
import User from '#users/user';

test.group('CreateInvitationOptionsController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should create the owner and return a challenge stored in the session when the token is valid', async ({
		client,
		cleanup,
		assert,
	}) => {
		cleanup(swapWebauthnService(true));
		const { token } = await new PasskeyInvitationService().create();

		const response = await client
			.post(`/passkeys/invitations/${token}/options`)
			.withCsrfToken();

		response.assertStatus(200);
		assert.equal(response.body().challenge, 'fake-challenge');
		response.assertSession('passkeys.challenge.registration');
		assert.equal(
			await User.query()
				.count('* as total')
				.first()
				.then((row) => Number(row?.$extras.total)),
			1
		);
	});

	test('should return 404 when the token is unknown', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapWebauthnService(true));

		const response = await client
			.post('/passkeys/invitations/unknown-token/options')
			.withCsrfToken();

		response.assertStatus(404);
	});
});
