import { BaseSchema } from '@adonisjs/lucid/schema';

export default class CreatePasskeyInvitationsTable extends BaseSchema {
	static tableName = 'passkey_invitations';

	async up() {
		this.schema.createTable(
			CreatePasskeyInvitationsTable.tableName,
			(table) => {
				table.increments('id').primary();
				table.string('token_hash').notNullable().unique();
				table.timestamp('expires_at').notNullable();
				table.timestamp('used_at').nullable();
				table.timestamp('created_at').notNullable();
				table.timestamp('updated_at').nullable();
			}
		);
	}

	async down() {
		this.schema.dropTable(CreatePasskeyInvitationsTable.tableName);
	}
}
