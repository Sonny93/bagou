import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { PasskeyService } from '#passkeys/passkey_service';

@inject()
export default class DeletePasskeyController {
	constructor(private readonly passkeyService: PasskeyService) {}

	async execute({ auth, params, response }: HttpContext) {
		await this.passkeyService.delete(auth.getUserOrFail(), Number(params.id));
		return response.redirect().toRoute('passkeys.show_passkeys');
	}
}
