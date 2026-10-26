import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';
import { saveDraftTextValidator } from '#transcription_history/validators/save_draft_text_validator';

@inject()
export default class SaveDraftTextController {
	constructor(
		private readonly transcriptHistoryService: TranscriptHistoryService
	) {}

	async execute({ auth, request, response }: HttpContext) {
		const { params, text } = await request.validateUsing(
			saveDraftTextValidator
		);
		await this.transcriptHistoryService.saveDraftText(
			auth.getUserOrFail().id,
			params.draftId,
			text ?? ''
		);
		return response.noContent();
	}
}
