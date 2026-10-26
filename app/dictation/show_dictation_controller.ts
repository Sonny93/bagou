import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { DictationQuotaService } from '#dictation_quota/dictation_quota_service';

@inject()
export default class ShowDictationController {
	constructor(private readonly quotaService: DictationQuotaService) {}

	async render({ auth, inertia }: HttpContext) {
		const { id: userId } = auth.getUserOrFail();
		return inertia.render('dictation/show_dictation', {
			remainingMinutes: await this.quotaService.getRemainingMinutes(userId),
		});
	}
}
