import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { toCleanupQualityOptions } from '#text_cleanup/cleanup_quality_options';
import { TextCleaner } from '#text_cleanup/text_cleaner';
import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';
import TranscriptTransformer from '#transcription_history/transcript_transformer';
import { showTranscriptsValidator } from '#transcription_history/validators/show_transcripts_validator';
import { UserSettingsService } from '#user_settings/user_settings_service';

@inject()
export default class ShowTranscriptsController {
	constructor(
		private readonly transcriptHistoryService: TranscriptHistoryService,
		private readonly textCleaner: TextCleaner,
		private readonly userSettingsService: UserSettingsService
	) {}

	async render({ auth, inertia, request }: HttpContext) {
		const userId = auth.getUserOrFail().id;
		const { q: query, page = 1 } = await request.validateUsing(
			showTranscriptsValidator
		);
		const settings = await this.userSettingsService.get(userId);
		const transcripts = await this.transcriptHistoryService.list(userId, {
			query,
			page,
		});
		return inertia.render('transcription_history/show_transcripts', {
			transcripts: inertia.scroll(() =>
				TranscriptTransformer.paginate(transcripts.all(), transcripts.getMeta())
			),
			query: query ?? '',
			cleanupQualities: toCleanupQualityOptions(this.textCleaner.modelNames),
			cleanupQuality: settings.cleanupQuality,
			transcriptCount: await this.transcriptHistoryService.count(userId),
		});
	}
}
