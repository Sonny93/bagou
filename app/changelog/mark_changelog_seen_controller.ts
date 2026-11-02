import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { WhatsNewService } from '#changelog/whats_new_service';

@inject()
export default class MarkChangelogSeenController {
	constructor(private readonly whatsNewService: WhatsNewService) {}

	async execute({ auth, response }: HttpContext) {
		await this.whatsNewService.markSeen(auth.getUserOrFail());
		return response.noContent();
	}
}
