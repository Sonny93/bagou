import { inject } from '@adonisjs/core';
import { Logger } from '@adonisjs/core/logger';

import { describeErrorForLog } from '#dictation/describe_error_for_log';
import type { DictationTranscript } from '#dictation/dictation_transcript';
import { TextCleanupService } from '#text_cleanup/text_cleanup_service';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';
import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';

@inject()
export class DictationCompletionService {
	constructor(
		private readonly textCleanupService: TextCleanupService,
		private readonly historyService: TranscriptHistoryService,
		private readonly logger: Logger
	) {}

	/**
	 * A failing cleanup does not lose the dictation: it yields no cleaned text.
	 * Neither does a failing save to the history.
	 */
	async complete(
		userId: number,
		rawText: string
	): Promise<DictationTranscript> {
		const transcript = {
			rawText,
			cleanedText: await this.#cleanOrNull(rawText),
		};
		await this.#saveOrLog(userId, transcript);
		return transcript;
	}

	async #saveOrLog(
		userId: number,
		transcript: Readonly<DictationTranscript>
	): Promise<void> {
		try {
			await this.historyService.save(userId, transcript);
		} catch (error) {
			this.logger.error(
				describeErrorForLog(error),
				'Transcript could not be saved'
			);
		}
	}

	async #cleanOrNull(rawText: string): Promise<string | null> {
		try {
			return await this.textCleanupService.clean(rawText);
		} catch (error) {
			if (error instanceof TextCleanupUnavailableException) return null;
			throw error;
		}
	}
}
