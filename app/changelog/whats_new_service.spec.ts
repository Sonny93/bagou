import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { WhatsNewService } from '#changelog/whats_new_service';
import { UserFactory } from '#database/factories/user_factory';
import User from '#users/user';

test.group('WhatsNewService', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should report the current version', ({ assert }) => {
		const { currentVersion } = new WhatsNewService('1.4.0').describe('1.2.0');

		assert.equal(currentVersion, '1.4.0');
	});

	test('should report an unseen version when nothing was seen yet', ({
		assert,
	}) => {
		assert.isTrue(new WhatsNewService('1.4.0').describe(null).hasUnseen);
	});

	test('should report an unseen version when the seen one is older', ({
		assert,
	}) => {
		assert.isTrue(new WhatsNewService('1.4.0').describe('1.2.0').hasUnseen);
	});

	test('should report nothing unseen when the seen version is the current or a newer one', ({
		assert,
	}) => {
		const service = new WhatsNewService('1.4.0');

		assert.isFalse(service.describe('1.4.0').hasUnseen);
		assert.isFalse(service.describe('1.5.0').hasUnseen);
	});

	test('should report nothing unseen when the seen version is unparseable', ({
		assert,
	}) => {
		assert.isFalse(new WhatsNewService('1.4.0').describe('garbage').hasUnseen);
	});

	test('should report nothing unseen when the current version is unparseable', ({
		assert,
	}) => {
		assert.isFalse(new WhatsNewService('dev').describe('1.2.0').hasUnseen);
	});

	test('should store the current version when nothing was seen yet', async ({
		assert,
	}) => {
		const user = await UserFactory.create();

		await new WhatsNewService('1.4.0').markSeen(user);

		assert.equal((await User.findOrFail(user.id)).lastSeenVersion, '1.4.0');
	});

	test('should store the current version when the seen one is older', async ({
		assert,
	}) => {
		const user = await UserFactory.merge({ lastSeenVersion: '1.2.0' }).create();

		await new WhatsNewService('1.4.0').markSeen(user);

		assert.equal((await User.findOrFail(user.id)).lastSeenVersion, '1.4.0');
	});

	test('should keep a seen version that is newer than the current one', async ({
		assert,
	}) => {
		const user = await UserFactory.merge({ lastSeenVersion: '1.6.0' }).create();

		await new WhatsNewService('1.4.0').markSeen(user);

		assert.equal((await User.findOrFail(user.id)).lastSeenVersion, '1.6.0');
	});
});
