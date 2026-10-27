import { BaseSchema } from '@adonisjs/lucid/schema';

const EXISTING_USERS_DICTATION_LANGUAGE = 'fr';
const DEFAULT_INTERFACE_LANGUAGE = 'system';

export default class CreateUserSettingsTable extends BaseSchema {
	static tableName = 'user_settings';

	async up() {
		this.schema.createTable(CreateUserSettingsTable.tableName, (table) => {
			table.increments('id').primary();
			table
				.integer('user_id')
				.unsigned()
				.notNullable()
				.unique()
				.references('id')
				.inTable('users')
				.onDelete('CASCADE');
			table.string('dictation_language').notNullable();
			table.string('interface_language').notNullable();
			table.jsonb('vocabulary').notNullable().defaultTo('[]');
			table.text('cleanup_instructions').notNullable().defaultTo('');
			table.timestamp('created_at').notNullable();
			table.timestamp('updated_at').nullable();
		});
		this.defer(async (database) => {
			await database.rawQuery(
				`INSERT INTO ${CreateUserSettingsTable.tableName} (user_id, dictation_language, interface_language, created_at, updated_at)
				SELECT id, ?, ?, NOW(), NOW() FROM users`,
				[EXISTING_USERS_DICTATION_LANGUAGE, DEFAULT_INTERFACE_LANGUAGE]
			);
		});
	}

	async down() {
		this.schema.dropTable(CreateUserSettingsTable.tableName);
	}
}
