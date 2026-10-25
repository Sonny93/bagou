import { BaseCommand } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import { PasskeyInvitationService } from '#passkeys/passkey_invitation_service';
import env from '#start/env';

export default class InvitePasskey extends BaseCommand {
	static commandName = 'passkey:invite';
	static description =
		'Create a single-use link to register a passkey (first setup or recovery)';
	static options: CommandOptions = { startApp: true };

	async run() {
		const invitationService = await this.app.container.make(
			PasskeyInvitationService
		);
		const { token, expiresAt } = await invitationService.create();
		const invitationUrl = new URL(
			`/passkeys/invitations/${token}`,
			env.get('APP_URL')
		);
		this.logger.success(`Invitation valid until ${expiresAt.toISOTime()}`);
		this.logger.log(invitationUrl.href);
	}
}
