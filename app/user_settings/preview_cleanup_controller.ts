import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { CorrectionService } from '#corrections/correction_service';
import { TextCleanupService } from '#text_cleanup/text_cleanup_service';
import { toCleanupPreferences } from '#user_settings/to_cleanup_preferences';
import { toPreviewSettings } from '#user_settings/to_preview_settings';
import { previewCleanupValidator } from '#user_settings/validators/preview_cleanup_validator';

@inject()
export default class PreviewCleanupController {
	constructor(
		private readonly textCleanupService: TextCleanupService,
		private readonly correctionService: CorrectionService
	) {}

	/**
	 * Cleans a sample text with the form values, saved or not, and the saved
	 * corrections; stores nothing.
	 */
	async execute({ auth, request }: HttpContext) {
		const { text, ...settings } = await request.validateUsing(
			previewCleanupValidator
		);
		const corrections = await this.correctionService.listPairs(
			auth.getUserOrFail().id
		);
		const cleanedText = await this.textCleanupService.clean(
			text,
			toCleanupPreferences(toPreviewSettings(settings), corrections)
		);
		return { cleanedText };
	}
}
