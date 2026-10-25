import { inject } from '@adonisjs/core';
import { Database } from '@adonisjs/lucid/database';

import User from '#users/user';

const OWNER_CREATION_LOCK_KEY = 7_204_001;

/**
 * The app is single-user: at most one User row exists, the owner.
 */
@inject()
export class UserService {
	constructor(private readonly database: Database) {}

	async findOwner(): Promise<User | null> {
		return User.query().orderBy('id', 'asc').first();
	}

	async findOrCreateOwner(): Promise<User> {
		return this.database.transaction(async (transaction) => {
			await transaction.rawQuery('select pg_advisory_xact_lock(?)', [
				OWNER_CREATION_LOCK_KEY,
			]);
			const existingOwner = await User.query({ client: transaction })
				.orderBy('id', 'asc')
				.first();
			if (existingOwner) return existingOwner;
			return User.create({}, { client: transaction });
		});
	}
}
