import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { PasskeyFactory } from '#database/factories/passkey_factory';
import { CEREMONIES } from '#passkeys/passkey_challenge_service';
import { buildPendingChallengeSession } from '#tests/helpers/build_pending_challenge_session';
import {
	FAKE_CREDENTIAL_ID,
	FAKE_NEW_COUNTER,
} from '#tests/helpers/fake_webauthn_service';
import { buildAuthenticationBody } from '#tests/helpers/passkey_response_fixtures';
import { swapWebauthnService } from '#tests/helpers/swap_webauthn_service';

test.group('VerifyAuthenticationController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should log the user in and record the usage when the assertion is valid', async ({
		client,
		cleanup,
		assert,
	}) => {
		cleanup(swapWebauthnService(true));
		const passkey = await PasskeyFactory.merge({
			credentialId: FAKE_CREDENTIAL_ID,
		})
			.with('user')
			.create();

		const response = await client
			.post('/passkeys/authentication/verify')
			.withCsrfToken()
			.withSession(buildPendingChallengeSession(CEREMONIES.authentication))
			.json(buildAuthenticationBody());

		response.assertStatus(200);
		response.assertBodyContains({ authenticated: true });
		response.assertSession('auth_web', passkey.userId);
		await passkey.refresh();
		assert.equal(passkey.counter, FAKE_NEW_COUNTER);
		assert.isNotNull(passkey.lastUsedAt);
	});

	test('should return 401 and log nobody in when the verification fails', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapWebauthnService(false));
		await PasskeyFactory.merge({ credentialId: FAKE_CREDENTIAL_ID })
			.with('user')
			.create();

		const response = await client
			.post('/passkeys/authentication/verify')
			.withCsrfToken()
			.withSession(buildPendingChallengeSession(CEREMONIES.authentication))
			.json(buildAuthenticationBody());

		response.assertStatus(401);
		response.assertSessionMissing('auth_web');
	});

	test('should return 401 when the credential is unknown', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapWebauthnService(true));

		const response = await client
			.post('/passkeys/authentication/verify')
			.withCsrfToken()
			.withSession(buildPendingChallengeSession(CEREMONIES.authentication))
			.json(buildAuthenticationBody('unknown-credential'));

		response.assertStatus(401);
	});

	test('should return 400 when no challenge is pending in the session', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapWebauthnService(true));

		const response = await client
			.post('/passkeys/authentication/verify')
			.withCsrfToken()
			.json(buildAuthenticationBody());

		response.assertStatus(400);
	});

	test('should return 422 when the body is not an authentication response', async ({
		client,
	}) => {
		const response = await client
			.post('/passkeys/authentication/verify')
			.withCsrfToken()
			.accept('json')
			.json({ response: { id: 'x' } });

		response.assertStatus(422);
	});
});
