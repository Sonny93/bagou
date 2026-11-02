import { BaseSchema } from '@adonisjs/lucid/schema';

export default class AddLastSeenVersionToUsersTable extends BaseSchema {
	static tableName = 'users';

	async up() {
		this.schema.alterTable(
			AddLastSeenVersionToUsersTable.tableName,
			(table) => {
				table.string('last_seen_version').nullable();
			}
		);
	}

	async down() {
		this.schema.alterTable(
			AddLastSeenVersionToUsersTable.tableName,
			(table) => {
				table.dropColumn('last_seen_version');
			}
		);
	}
}
