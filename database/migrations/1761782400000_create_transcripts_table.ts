import { BaseSchema } from '@adonisjs/lucid/schema';

const SEARCHABLE_TEXT_SQL = 'coalesce(cleaned_text, raw_text)';

export default class CreateTranscriptsTable extends BaseSchema {
	static tableName = 'transcripts';

	async up() {
		this.schema.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm');
		this.schema.createTable(CreateTranscriptsTable.tableName, (table) => {
			table.increments('id').primary();
			table
				.integer('user_id')
				.unsigned()
				.notNullable()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
			table.text('raw_text').notNullable();
			table.text('cleaned_text').nullable();
			table.timestamp('created_at').notNullable();
		});
		this.schema.raw(`
			ALTER TABLE transcripts ADD COLUMN search_vector tsvector
			GENERATED ALWAYS AS (to_tsvector('french', ${SEARCHABLE_TEXT_SQL})) STORED
		`);
		this.schema.raw(
			'CREATE INDEX transcripts_search_vector_index ON transcripts USING GIN (search_vector)'
		);
		this.schema.raw(
			`CREATE INDEX transcripts_text_trigram_index ON transcripts USING GIN ((${SEARCHABLE_TEXT_SQL}) gin_trgm_ops)`
		);
		this.schema.raw(
			'CREATE INDEX transcripts_user_id_created_at_index ON transcripts (user_id, created_at DESC)'
		);
	}

	async down() {
		this.schema.dropTable(CreateTranscriptsTable.tableName);
	}
}
