import { inject } from '@adonisjs/core';
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import type { DateTime } from 'luxon';

import transcriptionHistoryConfig from '#config/transcription_history';
import { Clock } from '#shared/clock';
import { TextCleanupService } from '#text_cleanup/text_cleanup_service';
import type { DraftSegment } from '#transcription_history/draft_segment';
import Transcript from '#transcription_history/transcript';
import TranscriptNotFoundException from '#transcription_history/transcript_not_found_exception';
import { toCleanupPreferences } from '#user_settings/to_cleanup_preferences';
import { UserSettingsService } from '#user_settings/user_settings_service';

export const TRANSCRIPTS_PER_PAGE = 20;

const RAW_SEGMENT_SEPARATOR = ' ';

type TranscriptListing = {
	query?: string;
	page: number;
};

@inject()
export class TranscriptHistoryService {
	constructor(
		private readonly clock: Clock,
		private readonly textCleanupService: TextCleanupService,
		private readonly userSettingsService: UserSettingsService
	) {}

	/**
	 * Appends a segment to the entry of its draft, created on the first one:
	 * the raw segments are kept in order, one space apart, and the cleaned draft
	 * replaces the entry's text only when there is one. Purges what this user no
	 * longer may keep first, so an expired entry of the same draft is not
	 * revived. A blank segment is skipped.
	 */
	async appendSegment(
		userId: number,
		draftId: string,
		{ rawSegment, cleanedDraft }: Readonly<DraftSegment>
	): Promise<void> {
		if (rawSegment.trim() === '') return;
		await Transcript.deleteOlderThan(userId, this.#retentionStart());
		const transcript = await Transcript.findByDraft(userId, draftId);
		if (!transcript) {
			await Transcript.create({
				userId,
				draftId,
				rawText: rawSegment,
				cleanedText: cleanedDraft,
				createdAt: this.clock.now(),
			});
			return;
		}
		transcript.rawText = `${transcript.rawText}${RAW_SEGMENT_SEPARATOR}${rawSegment}`;
		if (cleanedDraft !== null) transcript.cleanedText = cleanedDraft;
		await transcript.save();
	}

	/**
	 * Stores the draft text as the user left it, hand edits included, in the
	 * entry of its draft; a blank text clears it. Does nothing when no segment
	 * of that draft was dictated yet.
	 */
	async saveDraftText(
		userId: number,
		draftId: string,
		text: string
	): Promise<void> {
		const transcript = await Transcript.findByDraft(userId, draftId);
		if (!transcript) return;
		transcript.cleanedText = text.trim() === '' ? null : text;
		await transcript.save();
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

	count(userId: number): Promise<number> {
		return Transcript.countOwned(userId);
	}

	/**
	 * Cleans the stored raw text of an entry that has no cleaned text yet; an
	 * already cleaned one is left alone so no credits are spent twice. Uses the
	 * user's current language, vocabulary and instructions.
	 */
	async clean(userId: number, id: number): Promise<void> {
		const transcript = await Transcript.findOwned(
			userId,
			id,
			this.#retentionStart()
		);
		if (!transcript) throw new TranscriptNotFoundException();
		if (transcript.cleanedText !== null) return;
		const settings = await this.userSettingsService.get(userId);
		transcript.cleanedText = await this.textCleanupService.clean(
			transcript.rawText,
			toCleanupPreferences(settings)
		);
		await transcript.save();
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
