import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreatePasskeysTable extends BaseSchema {
	static tableName = 'passkeys';

	async up() {
		this.schema.createTable(CreatePasskeysTable.tableName, (table) => {
			table.increments('id').primary();
			table
				.integer('user_id')
				.unsigned()
				.notNullable()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
			table.string('credential_id').notNullable().unique();
			table.binary('public_key').notNullable();
			table.bigInteger('counter').notNullable();
			table.json('transports').notNullable();
			table.string('device_type').notNullable();
			table.boolean('backed_up').notNullable();
			table.string('label').notNullable();
			table.timestamp('last_used_at').nullable();
			table.timestamp('created_at').notNullable();
			table.timestamp('updated_at').nullable();
		});
	}

	async down() {
		this.schema.dropTable(CreatePasskeysTable.tableName);
	}
}
