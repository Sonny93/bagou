import { inject } from '@adonisjs/core';
import { Logger } from '@adonisjs/core/logger';
import db from '@adonisjs/lucid/services/db';
import type { DateTime } from 'luxon';

import correctionSuggestionsConfig from '#config/correction_suggestions';
import transcriptionHistoryConfig from '#config/transcription_history';
import CorrectionSuggestion, {
	CORRECTION_SUGGESTION_STATUS,
} from '#correction_suggestions/correction_suggestion';
import CorrectionSuggestionsStorageException from '#correction_suggestions/correction_suggestions_storage_exception';
import type { CorrectionPair } from '#corrections/correction_pair';
import { describeErrorForLog } from '#dictation/describe_error_for_log';
import { Clock } from '#shared/clock';
import Transcript from '#transcription_history/transcript';

@inject()
export class CorrectionSuggestionService {
	constructor(
		private readonly logger: Logger,
		private readonly clock: Clock
	) {}

	/**
	 * Stores the pairs as pending suggestions, linked to the entry of the draft
	 * when it exists (the client never names a transcript). Skips what the user
	 * already remembers, never revives a dismissed pair, purges what is older
	 * than the history retention and drops the oldest beyond the cap.
	 *
	 * @returns The pending suggestions, newest first.
	 */
	async push(
		userId: number,
		draftId: string,
		pairs: readonly CorrectionPair[]
	): Promise<CorrectionSuggestion[]> {
		await this.#withoutRowValuesInErrors(async () => {
			const transcript = await Transcript.findByDraft(userId, draftId);
			await db.transaction(async (trx) => {
				for (const { heard, written } of pairs) {
					await CorrectionSuggestion.upsertPending(
						userId,
						transcript?.id ?? null,
						heard,
						written,
						trx
					);
				}
				await CorrectionSuggestion.deletePendingOlderThan(
					userId,
					this.#retentionStart(),
					trx
				);
				await CorrectionSuggestion.trimOldest(
					userId,
					CORRECTION_SUGGESTION_STATUS.pending,
					correctionSuggestionsConfig.maxPendingSuggestions,
					trx
				);
			});
		});
		return this.listPending(userId);
	}

	/** Never suggested again; also imports the dismissals a device kept locally. */
	dismiss(userId: number, pairs: readonly CorrectionPair[]): Promise<void> {
		return this.#withoutRowValuesInErrors(() =>
			db.transaction(async (trx) => {
				for (const { heard, written } of pairs) {
					await CorrectionSuggestion.upsertDismissed(
						userId,
						heard,
						written,
						trx
					);
				}
				await CorrectionSuggestion.trimOldest(
					userId,
					CORRECTION_SUGGESTION_STATUS.dismissed,
					correctionSuggestionsConfig.maxDismissedSuggestions,
					trx
				);
			})
		);
	}

	/** Newest first. */
	listPending(userId: number): Promise<CorrectionSuggestion[]> {
		return CorrectionSuggestion.listPendingNotRemembered(
			userId,
			this.#retentionStart()
		);
	}

	async listDismissedPairs(userId: number): Promise<CorrectionPair[]> {
		const dismissed = await CorrectionSuggestion.listDismissed(userId);
		return dismissed.map(({ heard, written }) => ({ heard, written }));
	}

	#retentionStart(): DateTime {
		return this.clock
			.now()
			.minus({ days: transcriptionHistoryConfig.retentionDays });
	}

	/**
	 * A driver error carries the values of the row in its `detail`: log only its
	 * name and code, and throw an error that holds nothing of it.
	 */
	async #withoutRowValuesInErrors<TResult>(
		operation: () => Promise<TResult>
	): Promise<TResult> {
		try {
			return await operation();
		} catch (error) {
			this.logger.error(
				describeErrorForLog(error),
				'Correction suggestions could not be written'
			);
			throw new CorrectionSuggestionsStorageException();
		}
	}
}
