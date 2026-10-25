import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { PasskeyRegistrationService } from '#passkeys/passkey_registration_service';

@inject()
export default class CreateInvitationOptionsController {
	constructor(
		private readonly registrationService: PasskeyRegistrationService
	) {}

	async execute({ params, session }: HttpContext) {
		return this.registrationService.createOptionsWithInvitation(
			params.token,
			session
		);
	}
}
