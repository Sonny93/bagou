import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { PasskeyService } from '#passkeys/passkey_service';
import { verifyAuthenticationValidator } from '#passkeys/validators/verify_authentication_validator';

@inject()
export default class VerifyAuthenticationController {
	constructor(private readonly passkeyService: PasskeyService) {}

	async execute({ auth, request, session }: HttpContext) {
		const { response } = await request.validateUsing(
			verifyAuthenticationValidator
		);
		const user = await this.passkeyService.authenticate({
			response,
			challenges: session,
		});
		await auth.use('web').login(user);
		return { authenticated: true };
	}
}
