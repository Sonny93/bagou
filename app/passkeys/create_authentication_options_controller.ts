import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { PasskeyService } from '#passkeys/passkey_service';

@inject()
export default class CreateAuthenticationOptionsController {
	constructor(private readonly passkeyService: PasskeyService) {}

	async execute({ session }: HttpContext) {
		return this.passkeyService.createAuthenticationOptions(session);
	}
}
