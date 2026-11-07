import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import userSettingsConfig from '#config/user_settings';
import { CorrectionSchema } from '#database/schema';

const UPSERT_SQL = `
	INSERT INTO corrections (user_id, heard, written, created_at, updated_at)
	VALUES (?, ?, ?, clock_timestamp(), clock_timestamp())
	ON CONFLICT (user_id, lower(heard), lower(written))
	DO UPDATE SET written = EXCLUDED.written, heard = EXCLUDED.heard, updated_at = clock_timestamp()
	RETURNING id`;

export default class Correction extends CorrectionSchema {
	/**
	 * @returns The user's pairs, the most recently added or refreshed first, at
	 * most the cap: whatever a race stored beyond it never reaches a prompt.
	 */
	static listNewestFirst(userId: number): Promise<Correction[]> {
		return Correction.query()
			.where('userId', userId)
			.orderBy('updatedAt', 'desc')
			.orderBy('id', 'desc')
			.limit(userSettingsConfig.maxCorrections);
	}

	static async countOwned(
		userId: number,
		client?: TransactionClientContract
	): Promise<number> {
		const counted = await Correction.query({ client })
			.where('userId', userId)
			.count('* as total')
			.first();
		return Number(counted?.$extras.total ?? 0);
	}

	/** Compares case-insensitively, like the unique index. */
	static async existsPair(
		userId: number,
		heard: string,
		written: string,
		client?: TransactionClientContract
	): Promise<boolean> {
		const found = await Correction.query({ client })
			.where('userId', userId)
			.whereRaw('lower(heard) = lower(?)', [heard])
			.whereRaw('lower(written) = lower(?)', [written])
			.first();
		return found !== null;
	}

	/**
	 * Inserts the pair, or refreshes the casing and the recency of the one that
	 * differs only by case, in a single atomic statement. A clock timestamp, not
	 * `now()`, so two upserts in one transaction still order.
	 */
	static async upsertPair(
		userId: number,
		heard: string,
		written: string,
		client: TransactionClientContract
	): Promise<Correction> {
		const { rows } = await client.rawQuery<{ rows: { id: number }[] }>(
			UPSERT_SQL,
			[userId, heard, written]
		);
		const [row] = rows;
		if (!row) throw new Error('Correction upsert returned no row');
		return Correction.query({ client }).where('id', row.id).firstOrFail();
	}

	/** Deleting a row that is gone or belongs to someone else does nothing. */
	static async deleteOwned(userId: number, id: number): Promise<void> {
		await Correction.query().where('userId', userId).where('id', id).delete();
	}
}
