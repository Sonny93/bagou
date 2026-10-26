import db from '@adonisjs/lucid/services/db';

import { DictationUsageSchema } from '#database/schema';

const UPSERT_INCREMENT_SQL = `
	INSERT INTO dictation_usages (user_id, day, received_bytes, created_at, updated_at)
	VALUES (?, ?, ?, NOW(), NOW())
	ON CONFLICT (user_id, day) DO UPDATE
	SET received_bytes = dictation_usages.received_bytes + EXCLUDED.received_bytes,
		updated_at = NOW()
`;

export default class DictationUsage extends DictationUsageSchema {
	/** Adds to the day's counter in one atomic statement, creating it when absent. */
	static async addReceivedBytes(
		userId: number,
		day: string,
		receivedBytes: number
	): Promise<void> {
		await db.rawQuery(UPSERT_INCREMENT_SQL, [userId, day, receivedBytes]);
	}

	/** @returns The bytes recorded for the day, 0 when nothing was recorded. */
	static async findReceivedBytes(userId: number, day: string): Promise<number> {
		const usage = await DictationUsage.query()
			.where('userId', userId)
			.where('day', day)
			.first();
		return usage ? Number(usage.receivedBytes) : 0;
	}
}
