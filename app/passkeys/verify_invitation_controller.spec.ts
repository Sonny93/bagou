import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import Passkey from '#passkeys/passkey';
import { CEREMONIES } from '#passkeys/passkey_challenge_service';
import PasskeyInvitation from '#passkeys/passkey_invitation';
import { PasskeyInvitationService } from '#passkeys/passkey_invitation_service';
import { buildPendingChallengeSession } from '#tests/helpers/build_pending_challenge_session';
import { FAKE_CREDENTIAL_ID } from '#tests/helpers/fake_webauthn_service';
import { buildRegistrationBody } from '#tests/helpers/passkey_response_fixtures';
import { swapWebauthnService } from '#tests/helpers/swap_webauthn_service';
import User from '#users/user';

test.group('VerifyInvitationController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should create the owner and the passkey, consume the invitation and log in when the registration is valid', async ({
		client,
		cleanup,
		assert,
	}) => {
		cleanup(swapWebauthnService(true));
		const { token } = await new PasskeyInvitationService().create();

		const response = await client
			.post(`/passkeys/invitations/${token}/verify`)
			.withCsrfToken()
			.withSession(buildPendingChallengeSession(CEREMONIES.registration))
			.json(buildRegistrationBody('MacBook'));

		response.assertStatus(200);
		response.assertBodyContains({ registered: true });
		const owner = await User.firstOrFail();
		const passkey = await Passkey.firstOrFail();
		response.assertSession('auth_web', owner.id);
		assert.equal(passkey.userId, owner.id);
		assert.equal(passkey.label, 'MacBook');
		assert.equal(passkey.credentialId, FAKE_CREDENTIAL_ID);
		assert.deepEqual(passkey.transports, ['internal']);
		assert.isNotNull((await PasskeyInvitation.firstOrFail()).usedAt);
	});

	test('should return 404 when the invitation was already used', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapWebauthnService(true));
		const { token } = await new PasskeyInvitationService().create();
		await PasskeyInvitation.query().update({ usedAt: new Date() });

		const response = await client
			.post(`/passkeys/invitations/${token}/verify`)
			.withCsrfToken()
			.withSession(buildPendingChallengeSession(CEREMONIES.registration))
			.json(buildRegistrationBody());

		response.assertStatus(404);
	});

	test('should return 400 and keep the invitation usable when the verification fails', async ({
		client,
		cleanup,
		assert,
	}) => {
		cleanup(swapWebauthnService(false));
		const { token } = await new PasskeyInvitationService().create();

		const response = await client
			.post(`/passkeys/invitations/${token}/verify`)
			.withCsrfToken()
			.withSession(buildPendingChallengeSession(CEREMONIES.registration))
			.json(buildRegistrationBody());

		response.assertStatus(400);
		assert.isNull((await PasskeyInvitation.firstOrFail()).usedAt);
		assert.isNull(await Passkey.first());
	});

	test('should return 422 when the passkey label is missing', async ({
		client,
		cleanup,
	}) => {
		cleanup(swapWebauthnService(true));
		const { token } = await new PasskeyInvitationService().create();

		const response = await client
			.post(`/passkeys/invitations/${token}/verify`)
			.withCsrfToken()
			.accept('json')
			.json({ ...buildRegistrationBody(), label: '' });

		response.assertStatus(422);
	});
});
