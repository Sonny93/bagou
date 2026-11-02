import { BaseSchema } from '@adonisjs/lucid/schema';

const CLEANUP_QUALITIES = ['standard', 'precise'];
const DEFAULT_CLEANUP_QUALITY = 'standard';

export default class AddCleanupQualityToUserSettingsTable extends BaseSchema {
	static tableName = 'user_settings';

	async up() {
		this.schema.alterTable(
			AddCleanupQualityToUserSettingsTable.tableName,
			(table) => {
				table
					.string('cleanup_quality')
					.notNullable()
					.defaultTo(DEFAULT_CLEANUP_QUALITY)
					.checkIn(CLEANUP_QUALITIES);
			}
		);
	}

	async down() {
		this.schema.alterTable(
			AddCleanupQualityToUserSettingsTable.tableName,
			(table) => {
				table.dropColumn('cleanup_quality');
			}
		);
	}
}
