import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import { swapWebauthnService } from '#tests/helpers/swap_webauthn_service';

test.group('CreateRegistrationOptionsController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should return a challenge and store it in the session when the user is logged in', async ({
		client,
		cleanup,
		assert,
	}) => {
		cleanup(swapWebauthnService(true));
		const user = await UserFactory.create();

		const response = await client
			.post('/passkeys/registration/options')
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(200);
		assert.equal(response.body().challenge, 'fake-challenge');
		response.assertSession('passkeys.challenge.registration');
	});

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client
			.post('/passkeys/registration/options')
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});
});
