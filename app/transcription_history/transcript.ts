import { belongsTo } from '@adonisjs/lucid/orm';
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import type { DateTime } from 'luxon';

import { TranscriptSchema } from '#database/schema';
import type { TranscriptSearch } from '#transcription_history/transcript_search';
import User from '#users/user';

const SEARCHABLE_TEXT_SQL = 'coalesce(cleaned_text, raw_text)';
const FULL_TEXT_QUERY_SQL = "websearch_to_tsquery('french', ?)";
const MATCH_SQL = `(search_vector @@ ${FULL_TEXT_QUERY_SQL} OR ? <% ${SEARCHABLE_TEXT_SQL})`;
const RANK_SQL = `ts_rank(search_vector, ${FULL_TEXT_QUERY_SQL}) DESC, word_similarity(?, ${SEARCHABLE_TEXT_SQL}) DESC`;

export default class Transcript extends TranscriptSchema {
	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;

	/**
	 * A query matches by French full text (stemming) or by trigram word
	 * similarity (typos), best matches first; without a query, newest first.
	 */
	static paginateSearch({
		userId,
		since,
		query,
		page,
		perPage,
	}: Readonly<TranscriptSearch>): Promise<ModelPaginatorContract<Transcript>> {
		const transcripts = Transcript.query()
			.where('userId', userId)
			.where('createdAt', '>=', since.toSQL() ?? '');
		if (query) {
			transcripts
				.whereRaw(MATCH_SQL, [query, query])
				.orderByRaw(RANK_SQL, [query, query]);
		}
		return transcripts.orderBy('createdAt', 'desc').paginate(page, perPage);
	}

	/** @returns The row when it belongs to the user and is not older than `since`. */
	static findOwned(
		userId: number,
		id: number,
		since: DateTime
	): Promise<Transcript | null> {
		return Transcript.query()
			.where('userId', userId)
			.where('id', id)
			.where('createdAt', '>=', since.toSQL() ?? '')
			.first();
	}

	static async deleteOlderThan(
		userId: number,
		cutoff: DateTime
	): Promise<void> {
		await Transcript.query()
			.where('userId', userId)
			.where('createdAt', '<', cutoff.toSQL() ?? '')
			.delete();
	}

	/** @returns Whether a row of this user was deleted. */
	static async deleteOwned(userId: number, id: number): Promise<boolean> {
		const [deletedCount] = await Transcript.query()
			.where('userId', userId)
			.where('id', id)
			.delete();
		return Number(deletedCount) > 0;
	}

	/** Counts every row of the user, exactly what `deleteAllOwned` deletes. */
	static async countOwned(userId: number): Promise<number> {
		const counted = await Transcript.query()
			.where('userId', userId)
			.count('* as total')
			.first();
		return Number(counted?.$extras.total ?? 0);
	}

	static async deleteAllOwned(userId: number): Promise<void> {
		await Transcript.query().where('userId', userId).delete();
	}
}
