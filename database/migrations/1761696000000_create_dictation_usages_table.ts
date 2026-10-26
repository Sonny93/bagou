import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateDictationUsagesTable extends BaseSchema {
	static tableName = 'dictation_usages';

	async up() {
		this.schema.createTable(CreateDictationUsagesTable.tableName, (table) => {
			table.increments('id').primary();
			table
				.integer('user_id')
				.unsigned()
				.notNullable()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
			table.date('day').notNullable();
			table.bigInteger('received_bytes').notNullable().defaultTo(0);
			table.timestamp('created_at').notNullable();
			table.timestamp('updated_at').nullable();
			table.unique(['user_id', 'day']);
		});
	}

	async down() {
		this.schema.dropTable(CreateDictationUsagesTable.tableName);
	}
}
