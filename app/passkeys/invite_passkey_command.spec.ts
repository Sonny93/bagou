import ace from '@adonisjs/core/services/ace';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import PasskeyInvitation from '#passkeys/passkey_invitation';
import InvitePasskey from '../../commands/invite_passkey.ts';

test.group('InvitePasskey command', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should print a single-use invitation url and store its hash', async ({
		assert,
	}) => {
		ace.ui.switchMode('raw');
		const command = await ace.create(InvitePasskey, []);

		await command.exec();

		command.assertSucceeded();
		const printedUrl = command.ui.logger
			.getLogs()
			.map(({ message }: { message: string }) => message)
			.find((message: string) => message.includes('/passkeys/invitations/'));
		assert.match(
			printedUrl ?? '',
			/http:\/\/localhost:3334\/passkeys\/invitations\/[A-Za-z0-9_-]{43}$/
		);
		assert.equal((await PasskeyInvitation.all()).length, 1);
	});
});
