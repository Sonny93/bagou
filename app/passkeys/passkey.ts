import { belongsTo, column } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';

import { PasskeySchema } from '#database/schema';
import User from '#users/user';

export default class Passkey extends PasskeySchema {
	@column({ consume: (value: string | number | bigint) => Number(value) })
	declare counter: number;

	@column({
		prepare: (value: string[]) => JSON.stringify(value),
		consume: (value: string[]) => value,
	})
	declare transports: string[];

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;
}
