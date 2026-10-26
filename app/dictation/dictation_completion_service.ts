import { inject } from '@adonisjs/core';
import { Logger } from '@adonisjs/core/logger';

import { describeErrorForLog } from '#dictation/describe_error_for_log';
import type { DictationTranscript } from '#dictation/dictation_transcript';
import type { DraftContext } from '#dictation/draft_context';
import { joinDraft } from '#dictation/join_draft';
import { TextCleanupService } from '#text_cleanup/text_cleanup_service';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';
import type { DraftSegment } from '#transcription_history/draft_segment';
import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';

@inject()
export class DictationCompletionService {
	constructor(
		private readonly textCleanupService: TextCleanupService,
		private readonly historyService: TranscriptHistoryService,
		private readonly logger: Logger
	) {}

	/**
	 * Cleans the whole draft around the new segment, then appends the segment to
	 * the draft's history entry. A blank segment costs and stores nothing. A
	 * failing cleanup does not lose the dictation: it yields no cleaned draft.
	 * Neither does a failing save to the history.
	 */
	async complete(
		userId: number,
		draft: Readonly<DraftContext>,
		rawSegment: string
	): Promise<DictationTranscript> {
		if (rawSegment.trim() === '') {
			return { rawText: rawSegment, cleanedDraft: null };
		}
		const cleanedDraft = await this.#cleanOrNull(joinDraft(draft, rawSegment));
		await this.#saveOrLog(userId, draft.draftId, { rawSegment, cleanedDraft });
		return { rawText: rawSegment, cleanedDraft };
	}

	/** Appends the raw segment of a cancelled dictation as is: no cleanup, so no credits spent. */
	async keepRaw(
		userId: number,
		draftId: string,
		rawSegment: string
	): Promise<void> {
		await this.#saveOrLog(userId, draftId, { rawSegment, cleanedDraft: null });
	}

	async #saveOrLog(
		userId: number,
		draftId: string,
		segment: Readonly<DraftSegment>
	): Promise<void> {
		try {
			await this.historyService.appendSegment(userId, draftId, segment);
		} catch (error) {
			this.logger.error(
				describeErrorForLog(error),
				'Transcript could not be saved'
			);
		}
	}

	async #cleanOrNull(draftText: string): Promise<string | null> {
		try {
			return await this.textCleanupService.clean(draftText);
		} catch (error) {
			if (error instanceof TextCleanupUnavailableException) return null;
			throw error;
		}
	}
}
