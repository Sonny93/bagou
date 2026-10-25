import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { PasskeyRegistrationService } from '#passkeys/passkey_registration_service';
import { verifyRegistrationValidator } from '#passkeys/validators/verify_registration_validator';

@inject()
export default class VerifyRegistrationController {
	constructor(
		private readonly registrationService: PasskeyRegistrationService
	) {}

	async execute({ auth, request, session }: HttpContext) {
		const { label, response } = await request.validateUsing(
			verifyRegistrationValidator
		);
		await this.registrationService.register({
			owner: auth.getUserOrFail(),
			label,
			response,
			challenges: session,
		});
		return { registered: true };
	}
}
