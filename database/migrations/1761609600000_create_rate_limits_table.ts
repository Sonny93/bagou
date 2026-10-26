import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreateRateLimitsTable extends BaseSchema {
	static tableName = 'rate_limits';

	async up() {
		this.schema.createTable(CreateRateLimitsTable.tableName, (table) => {
			table.string('key', 255).notNullable().primary();
			table.integer('points', 9).notNullable().defaultTo(0);
			table.bigint('expire').unsigned();
		});
	}

	async down() {
		this.schema.dropTable(CreateRateLimitsTable.tableName);
	}
}
