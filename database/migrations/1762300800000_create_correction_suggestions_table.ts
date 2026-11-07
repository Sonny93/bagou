import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateCorrectionSuggestionsTable extends BaseSchema {
	static tableName = 'correction_suggestions';

	async up() {
		this.schema.createTable(
			CreateCorrectionSuggestionsTable.tableName,
			(table) => {
				table.increments('id').primary();
				table
					.integer('user_id')
					.unsigned()
					.notNullable()
					.references('id')
					.inTable('users')
					.onDelete('CASCADE');
				table
					.integer('transcript_id')
					.unsigned()
					.nullable()
					.references('id')
					.inTable('transcripts')
					.onDelete('CASCADE');
				table.string('heard').notNullable();
				table.string('written').notNullable();
				table.string('status').notNullable();
				table.timestamp('created_at').notNullable();
				table.timestamp('updated_at').notNullable();
			}
		);
		this.schema.raw(
			"ALTER TABLE correction_suggestions ADD CONSTRAINT correction_suggestions_status_check CHECK (status IN ('pending', 'dismissed'))"
		);
		this.schema.raw(
			'CREATE UNIQUE INDEX correction_suggestions_user_id_heard_written_unique ON correction_suggestions (user_id, lower(heard), lower(written))'
		);
		this.schema.raw(
			'CREATE INDEX correction_suggestions_user_id_status_updated_at_index ON correction_suggestions (user_id, status, updated_at DESC)'
		);
		this.schema.raw(
			'CREATE INDEX correction_suggestions_transcript_id_index ON correction_suggestions (transcript_id)'
		);
	}

	async down() {
		this.schema.dropTable(CreateCorrectionSuggestionsTable.tableName);
	}
}
