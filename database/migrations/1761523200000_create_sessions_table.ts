import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateSessionsTable extends BaseSchema {
	static tableName = 'sessions';

	async up() {
		this.schema.createTable(CreateSessionsTable.tableName, (table) => {
			table.string('id').primary();
			table.text('data').notNullable();
			table.string('user_id').nullable().index();
			table.timestamp('expires_at').notNullable().index();
		});
	}

	async down() {
		this.schema.dropTable(CreateSessionsTable.tableName);
	}
}
