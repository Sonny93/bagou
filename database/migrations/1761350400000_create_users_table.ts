import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateUsersTable extends BaseSchema {
	static tableName = 'users';

	async up() {
		this.schema.createTable(CreateUsersTable.tableName, (table) => {
			table.increments('id').primary();
			table.timestamp('created_at').notNullable();
			table.timestamp('updated_at').nullable();
		});
	}

	async down() {
		this.schema.dropTable(CreateUsersTable.tableName);
	}
}
