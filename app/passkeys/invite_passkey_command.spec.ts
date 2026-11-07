import ace from '@adonisjs/core/services/ace';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import PasskeyInvitation from '#passkeys/passkey_invitation';
import env from '#start/env';
import InvitePasskey from '../../commands/invite_passkey.ts';

const INVITATION_TOKEN_PATTERN = '/passkeys/invitations/[A-Za-z0-9_-]{43}$';

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
			new RegExp(escapeRegExp(env.get('APP_URL')) + INVITATION_TOKEN_PATTERN)
		);
		assert.equal((await PasskeyInvitation.all()).length, 1);
	});
});
