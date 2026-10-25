import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { UserFactory } from '#database/factories/user_factory';
import Passkey from '#passkeys/passkey';
import { CEREMONIES } from '#passkeys/passkey_challenge_service';
import { buildPendingChallengeSession } from '#tests/helpers/build_pending_challenge_session';
import { buildRegistrationBody } from '#tests/helpers/passkey_response_fixtures';
import { swapWebauthnService } from '#tests/helpers/swap_webauthn_service';

test.group('VerifyRegistrationController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should store the passkey for the logged in user when the registration is valid', async ({
		client,
		cleanup,
		assert,
	}) => {
		cleanup(swapWebauthnService(true));
		const user = await UserFactory.create();

		const response = await client
			.post('/passkeys/registration/verify')
			.loginAs(user)
			.withCsrfToken()
			.withSession(buildPendingChallengeSession(CEREMONIES.registration))
			.json(buildRegistrationBody('Téléphone'));

		response.assertStatus(200);
		const passkey = await Passkey.firstOrFail();
		assert.equal(passkey.userId, user.id);
		assert.equal(passkey.label, 'Téléphone');
	});

	test('should return 400 and store nothing when the verification fails', async ({
		client,
		cleanup,
		assert,
	}) => {
		cleanup(swapWebauthnService(false));
		const user = await UserFactory.create();

		const response = await client
			.post('/passkeys/registration/verify')
			.loginAs(user)
			.withCsrfToken()
			.withSession(buildPendingChallengeSession(CEREMONIES.registration))
			.json(buildRegistrationBody());

		response.assertStatus(400);
		assert.isNull(await Passkey.first());
	});

	test('should return 400 when no challenge is pending in the session', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapWebauthnService(true));
		const user = await UserFactory.create();

		const response = await client
			.post('/passkeys/registration/verify')
			.loginAs(user)
			.withCsrfToken()
			.json(buildRegistrationBody());

		response.assertStatus(400);
	});
});
