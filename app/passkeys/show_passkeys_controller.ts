import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { PasskeyService } from '#passkeys/passkey_service';
import PasskeyTransformer from '#passkeys/passkey_transformer';

@inject()
export default class ShowPasskeysController {
	constructor(private readonly passkeyService: PasskeyService) {}

	async render({ auth, inertia }: HttpContext) {
		const passkeys = await this.passkeyService.listForUser(
			auth.getUserOrFail()
		);
		return inertia.render('passkeys/show_passkeys', {
			passkeys: PasskeyTransformer.transform(passkeys),
		});
	}
}
