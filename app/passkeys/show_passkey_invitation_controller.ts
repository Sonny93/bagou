import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { PasskeyInvitationService } from '#passkeys/passkey_invitation_service';

@inject()
export default class ShowPasskeyInvitationController {
	constructor(private readonly invitationService: PasskeyInvitationService) {}

	async render({ inertia, params }: HttpContext) {
		await this.invitationService.assertUsable(params.token);
		return inertia.render('passkeys/show_passkey_invitation', {
			token: params.token,
		});
	}
}
