import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';

@inject()
export default class DeleteTranscriptController {
	constructor(
		private readonly transcriptHistoryService: TranscriptHistoryService
	) {}

	async execute({ auth, params, response }: HttpContext) {
		await this.transcriptHistoryService.delete(
			auth.getUserOrFail().id,
			Number(params.id)
		);
		return response.redirect().withQs().back();
	}
}
