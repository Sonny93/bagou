import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';
import TranscriptTransformer from '#transcription_history/transcript_transformer';
import { showTranscriptsValidator } from '#transcription_history/validators/show_transcripts_validator';

@inject()
export default class ShowTranscriptsController {
	constructor(
		private readonly transcriptHistoryService: TranscriptHistoryService
	) {}

	async render({ auth, inertia, request }: HttpContext) {
		const { q: query, page = 1 } = await request.validateUsing(
			showTranscriptsValidator
		);
		const transcripts = await this.transcriptHistoryService.list(
			auth.getUserOrFail().id,
			{ query, page }
		);
		return inertia.render('transcription_history/show_transcripts', {
			transcripts: inertia.scroll(() =>
				TranscriptTransformer.paginate(transcripts.all(), transcripts.getMeta())
			),
			query: query ?? '',
		});
	}
}
