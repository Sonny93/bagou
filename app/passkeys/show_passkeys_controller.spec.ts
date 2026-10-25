import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { PasskeyFactory } from '#database/factories/passkey_factory';
import { UserFactory } from '#database/factories/user_factory';

test.group('ShowPasskeysController', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect to the login page when the visitor is a guest', async ({
		client,
	}) => {
		const response = await client.get('/passkeys').redirects(0);

		response.assertStatus(302);
		response.assertHeader('location', '/login');
	});

	test('should render the passkeys of the user without exposing key material', async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		await PasskeyFactory.merge({ userId: user.id, label: 'MacBook' }).create();
		await PasskeyFactory.with('user').create();

		const response = await client.get('/passkeys').loginAs(user).withInertia();

		response.assertStatus(200);
		response.assertInertiaComponent('passkeys/show_passkeys');
		const [passkey] = response.inertiaProps.passkeys;
		assert.lengthOf(response.inertiaProps.passkeys, 1);
		assert.deepEqual(Object.keys(passkey).sort(), [
			'createdAt',
			'id',
			'label',
			'lastUsedAt',
		]);
		assert.equal(passkey.label, 'MacBook');
	});
});
