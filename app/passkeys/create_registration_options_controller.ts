import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { PasskeyRegistrationService } from '#passkeys/passkey_registration_service';

@inject()
export default class CreateRegistrationOptionsController {
	constructor(
		private readonly registrationService: PasskeyRegistrationService
	) {}

	async execute({ auth, session }: HttpContext) {
		return this.registrationService.createOptions(
			auth.getUserOrFail(),
			session
		);
	}
}
