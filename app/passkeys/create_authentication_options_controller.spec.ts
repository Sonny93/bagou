import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import { swapWebauthnService } from '#tests/helpers/swap_webauthn_service';

const AUTH_REQUESTS_PER_MINUTE = 10;

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

	test('should answer 429 with a French message once the auth rate limit is exceeded', async ({
		client,
		cleanup,
		assert,
	}) => {
		cleanup(swapWebauthnService(true));
		for (let attempt = 0; attempt < AUTH_REQUESTS_PER_MINUTE; attempt += 1) {
			const allowed = await client
				.post('/passkeys/authentication/options')
				.withCsrfToken();
			allowed.assertStatus(200);
		}

		const response = await client
			.post('/passkeys/authentication/options')
			.withCsrfToken()
			.header('Accept', 'application/json');

		response.assertStatus(429);
		assert.equal(
			response.body().errors[0].message,
			'Trop de requêtes, patiente une minute'
		);
	});
});
