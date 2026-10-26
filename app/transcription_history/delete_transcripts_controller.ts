import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';

@inject()
export default class DeleteTranscriptsController {
	constructor(
		private readonly transcriptHistoryService: TranscriptHistoryService
	) {}

	async execute({ auth, response }: HttpContext) {
		await this.transcriptHistoryService.deleteAll(auth.getUserOrFail().id);
		return response.redirect().withQs().back();
	}
}
