import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { PasskeyRegistrationService } from '#passkeys/passkey_registration_service';
import { verifyRegistrationValidator } from '#passkeys/validators/verify_registration_validator';

@inject()
export default class VerifyInvitationController {
	constructor(
		private readonly registrationService: PasskeyRegistrationService
	) {}

	async execute({ auth, params, request, session }: HttpContext) {
		const { label, response } = await request.validateUsing(
			verifyRegistrationValidator
		);
		const owner = await this.registrationService.registerWithInvitation({
			token: params.token,
			label,
			response,
			challenges: session,
		});
		await auth.use('web').login(owner);
		return { registered: true };
	}
}
