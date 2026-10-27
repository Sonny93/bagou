import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { UserSettingsService } from '#user_settings/user_settings_service';
import { updateSettingsValidator } from '#user_settings/validators/update_settings_validator';

@inject()
export default class UpdateSettingsController {
	constructor(private readonly userSettingsService: UserSettingsService) {}

	async execute({ auth, request, response }: HttpContext) {
		const { cleanupInstructions, ...settings } = await request.validateUsing(
			updateSettingsValidator
		);
		await this.userSettingsService.update(auth.getUserOrFail().id, {
			...settings,
			cleanupInstructions: cleanupInstructions ?? '',
		});
		return response.redirect().back();
	}
}
