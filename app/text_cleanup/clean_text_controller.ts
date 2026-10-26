import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { TextCleanupService } from '#text_cleanup/text_cleanup_service';
import { cleanTextValidator } from '#text_cleanup/validators/clean_text_validator';

@inject()
export default class CleanTextController {
	constructor(private readonly textCleanupService: TextCleanupService) {}

	async execute({ request }: HttpContext) {
		const { text } = await request.validateUsing(cleanTextValidator);
		return { text: await this.textCleanupService.clean(text ?? '') };
	}
}
