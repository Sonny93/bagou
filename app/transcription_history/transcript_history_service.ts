import { inject } from '@adonisjs/core';
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import type { DateTime } from 'luxon';

import transcriptionHistoryConfig from '#config/transcription_history';
import { Clock } from '#shared/clock';
import Transcript from '#transcription_history/transcript';
import type { TranscriptContent } from '#transcription_history/transcript_content';
import TranscriptNotFoundException from '#transcription_history/transcript_not_found_exception';

export const TRANSCRIPTS_PER_PAGE = 20;

type TranscriptListing = {
	query?: string;
	page: number;
};

@inject()
export class TranscriptHistoryService {
	constructor(private readonly clock: Clock) {}

	/** Keeps a finished dictation, then purges what this user no longer may keep. A blank one is skipped. */
	async save(
		userId: number,
		{ rawText, cleanedText }: Readonly<TranscriptContent>
	): Promise<void> {
		if (rawText.trim() === '') return;
		await Transcript.create({
			userId,
			rawText,
			cleanedText,
			createdAt: this.clock.now(),
		});
		await Transcript.deleteOlderThan(userId, this.#retentionStart());
	}

	/** Never lists a row past the retention, even when it is not purged yet. */
	list(
		userId: number,
		{ query, page }: Readonly<TranscriptListing>
	): Promise<ModelPaginatorContract<Transcript>> {
		return Transcript.paginateSearch({
			userId,
			since: this.#retentionStart(),
			query: this.#normalizeQuery(query),
			page,
			perPage: TRANSCRIPTS_PER_PAGE,
		});
	}

	async delete(userId: number, id: number): Promise<void> {
		const isDeleted = await Transcript.deleteOwned(userId, id);
		if (!isDeleted) throw new TranscriptNotFoundException();
	}

	async deleteAll(userId: number): Promise<void> {
		await Transcript.deleteAllOwned(userId);
	}

	#normalizeQuery(query: string | undefined): string | null {
		const trimmedQuery = query?.trim() ?? '';
		return trimmedQuery === '' ? null : trimmedQuery;
	}

	#retentionStart(): DateTime {
		return this.clock
			.now()
			.minus({ days: transcriptionHistoryConfig.retentionDays });
	}
}
