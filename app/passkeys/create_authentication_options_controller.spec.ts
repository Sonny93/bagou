import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import { swapWebauthnService } from '#tests/helpers/swap_webauthn_service';

test.group('CreateAuthenticationOptionsController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should return a challenge and store it in the session when the visitor is a guest', async ({
		client,
		cleanup,
		assert,
	}) => {
		cleanup(swapWebauthnService(true));

		const response = await client
			.post('/passkeys/authentication/options')
			.withCsrfToken();

		response.assertStatus(200);
		assert.equal(response.body().challenge, 'fake-challenge');
		response.assertSession('passkeys.challenge.authentication');
	});

	test('should redirect to the dictation page when the user is already logged in', async ({
		client,
	}) => {
		const user = await UserFactory.create();

		const response = await client
			.post('/passkeys/authentication/options')
			.loginAs(user)
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/');
	});

	test('should reject the request when the CSRF token is missing', async ({
		client,
	}) => {
		const response = await client
			.post('/passkeys/authentication/options')
			.redirects(0);

		response.assertStatus(302);
		response.assertFlashMessage('error');
	});
});
