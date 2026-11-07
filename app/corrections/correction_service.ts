import { inject } from '@adonisjs/core';
import { Logger } from '@adonisjs/core/logger';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import userSettingsConfig from '#config/user_settings';
import Correction from '#corrections/correction';
import type { CorrectionPair } from '#corrections/correction_pair';
import CorrectionsFullException from '#corrections/corrections_full_exception';
import CorrectionsStorageException from '#corrections/corrections_storage_exception';
import { joinSpeechTerms } from '#corrections/join_speech_terms';
import { describeErrorForLog } from '#dictation/describe_error_for_log';

/**
 * First key of the two-key advisory lock taken per user while adding a pair;
 * the user id is the second key. The constant keeps these locks apart from any
 * other advisory lock of the application.
 */
const ADD_LOCK_NAMESPACE = 1_130_000_001;

@inject()
export class CorrectionService {
	constructor(private readonly logger: Logger) {}

	/** Newest first. */
	list(userId: number): Promise<Correction[]> {
		return Correction.listNewestFirst(userId);
	}

	/** Newest first. */
	async listPairs(userId: number): Promise<CorrectionPair[]> {
		const corrections = await Correction.listNewestFirst(userId);
		return corrections.map(({ heard, written }) => ({ heard, written }));
	}

	/**
	 * Remembers the pair; one that already exists, whatever its case, is
	 * refreshed instead, even at the cap. Adds of one user are serialized by a
	 * transaction-scoped advisory lock, so concurrent adds never exceed the cap.
	 */
	async add(
		userId: number,
		{ heard, written }: Readonly<CorrectionPair>
	): Promise<Correction> {
		return this.#withoutRowValuesInErrors(() =>
			db.transaction(async (trx) => {
				await trx.rawQuery('SELECT pg_advisory_xact_lock(?, ?)', [
					ADD_LOCK_NAMESPACE,
					userId,
				]);
				const isKnown = await Correction.existsPair(
					userId,
					heard,
					written,
					trx
				);
				if (!isKnown && (await this.#isFull(userId, trx))) {
					throw new CorrectionsFullException();
				}
				return Correction.upsertPair(userId, heard, written, trx);
			})
		);
	}

	/** Idempotent, and scoped to the owner. */
	remove(userId: number, id: number): Promise<void> {
		return this.#withoutRowValuesInErrors(() =>
			Correction.deleteOwned(userId, id)
		);
	}

	/**
	 * How many corrected words speech recognition cannot receive because the
	 * vocabulary and the corrections together exceed its cap.
	 */
	countBeyondSpeechLimit(
		vocabulary: readonly string[],
		corrections: readonly CorrectionPair[]
	): number {
		const terms = joinSpeechTerms(
			vocabulary,
			corrections.map(({ written }) => written)
		);
		return Math.max(0, terms.length - userSettingsConfig.maxVocabularyTerms);
	}

	async #isFull(
		userId: number,
		client: TransactionClientContract
	): Promise<boolean> {
		const count = await Correction.countOwned(userId, client);
		return count >= userSettingsConfig.maxCorrections;
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
			if (error instanceof CorrectionsFullException) throw error;
			this.logger.error(
				describeErrorForLog(error),
				'Corrections could not be written'
			);
			throw new CorrectionsStorageException();
		}
	}
}
