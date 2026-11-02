import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';
import { cleanDraftValidator } from '#transcription_history/validators/clean_draft_validator';

@inject()
export default class CleanDraftController {
	constructor(
		private readonly transcriptHistoryService: TranscriptHistoryService
	) {}

	/** Cleans the current draft text again and stores it in the history entry of the draft. */
	async execute({ auth, request }: HttpContext) {
		const { params, text, cleanupQuality } =
			await request.validateUsing(cleanDraftValidator);
		const cleanedText = await this.transcriptHistoryService.cleanDraft(
			auth.getUserOrFail().id,
			params.draftId,
			text,
			cleanupQuality
		);
		return { cleanedText };
	}
}
