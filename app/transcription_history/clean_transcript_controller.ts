import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';
import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';

const CLEAN_ERROR_FIELD = 'clean';

@inject()
export default class CleanTranscriptController {
	constructor(
		private readonly transcriptHistoryService: TranscriptHistoryService
	) {}

	async execute({ auth, params, response, session }: HttpContext) {
		try {
			await this.transcriptHistoryService.clean(
				auth.getUserOrFail().id,
				Number(params.id)
			);
		} catch (error) {
			if (!(error instanceof TextCleanupUnavailableException)) throw error;
			session.flash('inputErrorsBag', { [CLEAN_ERROR_FIELD]: error.message });
		}
		return response.redirect().withQs().back();
	}
}
