import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';
import { recleanTranscriptValidator } from '#transcription_history/validators/reclean_transcript_validator';

@inject()
export default class RecleanTranscriptController {
	constructor(
		private readonly transcriptHistoryService: TranscriptHistoryService
	) {}

	/** Cleans the raw text of an entry again with the given quality and returns it; stores nothing. */
	async execute({ auth, request }: HttpContext) {
		const { params, cleanupQuality } = await request.validateUsing(
			recleanTranscriptValidator
		);
		const cleanedText = await this.transcriptHistoryService.recleanFromRaw(
			auth.getUserOrFail().id,
			params.id,
			cleanupQuality
		);
		return { cleanedText };
	}
}
