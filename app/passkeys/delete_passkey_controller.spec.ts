import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { PasskeyFactory } from '#database/factories/passkey_factory';
import { UserFactory } from '#database/factories/user_factory';
import Passkey from '#passkeys/passkey';

test.group('DeletePasskeyController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should delete the passkey when the user has another one', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const passkeyToDelete = await PasskeyFactory.merge({
			userId: user.id,
		}).create();
		await PasskeyFactory.merge({ userId: user.id }).create();

		const response = await client
			.delete(`/passkeys/${passkeyToDelete.id}`)
			.loginAs(user)
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/passkeys');
		assert.isNull(await Passkey.find(passkeyToDelete.id));
		assert.equal((await Passkey.all()).length, 1);
	});

	test('should return 409 and keep the passkey, exposing the error code, when it is the last one', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const lastPasskey = await PasskeyFactory.merge({
			userId: user.id,
		}).create();

		const response = await client
			.delete(`/passkeys/${lastPasskey.id}`)
			.header('Accept', 'application/json')
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(409);
		response.assertBodyContains({ code: 'E_LAST_PASSKEY' });
		assert.isNotNull(await Passkey.find(lastPasskey.id));
	});

	test('should return 404 when the passkey belongs to another user', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		await PasskeyFactory.merge({ userId: user.id }).create();
		const foreignPasskey = await PasskeyFactory.with('user').create();

		const response = await client
			.delete(`/passkeys/${foreignPasskey.id}`)
			.loginAs(user)
			.withCsrfToken();

		response.assertStatus(404);
		assert.isNotNull(await Passkey.find(foreignPasskey.id));
	});

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client
			.delete('/passkeys/1')
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});
});
