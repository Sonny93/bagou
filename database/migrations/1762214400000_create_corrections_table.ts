import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateCorrectionsTable extends BaseSchema {
	static tableName = 'corrections';

	async up() {
		this.schema.createTable(CreateCorrectionsTable.tableName, (table) => {
			table.increments('id').primary();
			table
				.integer('user_id')
				.unsigned()
				.notNullable()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
			table.string('heard').notNullable();
			table.string('written').notNullable();
			table.timestamp('created_at').notNullable();
			table.timestamp('updated_at').notNullable();
		});
		this.schema.raw(
			'CREATE UNIQUE INDEX corrections_user_id_heard_written_unique ON corrections (user_id, lower(heard), lower(written))'
		);
	}

	async down() {
		this.schema.dropTable(CreateCorrectionsTable.tableName);
	}
}
