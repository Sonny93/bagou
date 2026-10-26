import { BaseSchema } from '@adonisjs/lucid/schema';

export default class AddDraftIdToTranscriptsTable extends BaseSchema {
	static tableName = 'transcripts';

	async up() {
		this.schema.alterTable(AddDraftIdToTranscriptsTable.tableName, (table) => {
			table.uuid('draft_id').nullable();
			table.unique(['user_id', 'draft_id']);
		});
	}

	async down() {
		this.schema.alterTable(AddDraftIdToTranscriptsTable.tableName, (table) => {
			table.dropUnique(['user_id', 'draft_id']);
			table.dropColumn('draft_id');
		});
	}
}
