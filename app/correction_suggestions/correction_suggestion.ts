import type { TransactionClientContract } from '@adonisjs/lucid/types/database';
import type { DateTime } from 'luxon';

import { CorrectionSuggestionSchema } from '#database/schema';

const REMEMBERED_PAIR_SQL = `
	SELECT 1 FROM corrections
	WHERE corrections.user_id = ?::integer
		AND lower(corrections.heard) = lower(?::text)
		AND lower(corrections.written) = lower(?::text)`;

const NOT_REMEMBERED_SQL = `NOT EXISTS (
	SELECT 1 FROM corrections
	WHERE corrections.user_id = correction_suggestions.user_id
		AND lower(corrections.heard) = lower(correction_suggestions.heard)
		AND lower(corrections.written) = lower(correction_suggestions.written))`;

const UPSERT_PENDING_SQL = `
	INSERT INTO correction_suggestions
		(user_id, transcript_id, heard, written, status, created_at, updated_at)
	SELECT ?::integer, ?::integer, ?::text, ?::text, 'pending', clock_timestamp(), clock_timestamp()
	WHERE NOT EXISTS (${REMEMBERED_PAIR_SQL})
	ON CONFLICT (user_id, lower(heard), lower(written))
	DO UPDATE SET
		transcript_id = COALESCE(EXCLUDED.transcript_id, correction_suggestions.transcript_id),
		updated_at = clock_timestamp()
	WHERE correction_suggestions.status = 'pending'`;

const UPSERT_DISMISSED_SQL = `
	INSERT INTO correction_suggestions
		(user_id, transcript_id, heard, written, status, created_at, updated_at)
	VALUES (?, NULL, ?, ?, 'dismissed', clock_timestamp(), clock_timestamp())
	ON CONFLICT (user_id, lower(heard), lower(written))
	DO UPDATE SET status = 'dismissed', transcript_id = NULL, updated_at = clock_timestamp()`;

const TRIM_OLDEST_SQL = `
	DELETE FROM correction_suggestions
	WHERE id IN (
		SELECT id FROM correction_suggestions
		WHERE user_id = ? AND status = ?
		ORDER BY updated_at DESC, id DESC
		OFFSET ?)`;

export const CORRECTION_SUGGESTION_STATUS = {
	pending: 'pending',
	dismissed: 'dismissed',
} as const;

type CorrectionSuggestionStatus =
	(typeof CORRECTION_SUGGESTION_STATUS)[keyof typeof CORRECTION_SUGGESTION_STATUS];

export default class CorrectionSuggestion extends CorrectionSuggestionSchema {
	/**
	 * Stores the pair as pending, unless the user already remembers it (whatever
	 * the case). A pair already suggested only gets its recency, and the
	 * transcript, refreshed; a dismissed one never comes back to pending.
	 */
	static async upsertPending(
		userId: number,
		transcriptId: number | null,
		heard: string,
		written: string,
		client: TransactionClientContract
	): Promise<void> {
		await client.rawQuery(UPSERT_PENDING_SQL, [
			userId,
			transcriptId ?? client.knexRawQuery('NULL'),
			heard,
			written,
			userId,
			heard,
			written,
		]);
	}

	/** Dismissed rows outlive transcripts, so they keep no link to one. */
	static async upsertDismissed(
		userId: number,
		heard: string,
		written: string,
		client: TransactionClientContract
	): Promise<void> {
		await client.rawQuery(UPSERT_DISMISSED_SQL, [userId, heard, written]);
	}

	static async deletePendingOlderThan(
		userId: number,
		cutoff: DateTime,
		client: TransactionClientContract
	): Promise<void> {
		await CorrectionSuggestion.query({ client })
			.where('userId', userId)
			.where('status', CORRECTION_SUGGESTION_STATUS.pending)
			.where('updatedAt', '<', cutoff.toSQL() ?? '')
			.delete();
	}

	/** Drops the oldest rows of the status beyond the `keep` newest. */
	static async trimOldest(
		userId: number,
		status: CorrectionSuggestionStatus,
		keep: number,
		client: TransactionClientContract
	): Promise<void> {
		await client.rawQuery(TRIM_OLDEST_SQL, [userId, status, keep]);
	}

	/**
	 * Newest first, without the pairs the user remembers meanwhile: a race
	 * between a remember and a push never shows a stale suggestion. Never lists
	 * a row past the retention, even when it is not purged yet.
	 */
	static listPendingNotRemembered(
		userId: number,
		since: DateTime
	): Promise<CorrectionSuggestion[]> {
		return CorrectionSuggestion.query()
			.where('userId', userId)
			.where('status', CORRECTION_SUGGESTION_STATUS.pending)
			.where('updatedAt', '>=', since.toSQL() ?? '')
			.whereRaw(NOT_REMEMBERED_SQL)
			.orderBy('updatedAt', 'desc')
			.orderBy('id', 'desc');
	}

	static listDismissed(userId: number): Promise<CorrectionSuggestion[]> {
		return CorrectionSuggestion.query()
			.where('userId', userId)
			.where('status', CORRECTION_SUGGESTION_STATUS.dismissed)
			.orderBy('updatedAt', 'desc')
			.orderBy('id', 'desc');
	}

	/** Compares case-insensitively, like the unique index. */
	static async deletePendingPair(
		userId: number,
		heard: string,
		written: string,
		client: TransactionClientContract
	): Promise<void> {
		await CorrectionSuggestion.query({ client })
			.where('userId', userId)
			.where('status', CORRECTION_SUGGESTION_STATUS.pending)
			.whereRaw('lower(heard) = lower(?)', [heard])
			.whereRaw('lower(written) = lower(?)', [written])
			.delete();
	}
}
