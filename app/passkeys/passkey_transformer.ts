import { BaseTransformer } from '@adonisjs/core/transformers';

import type Passkey from '#passkeys/passkey';

export default class PasskeyTransformer extends BaseTransformer<Passkey> {
	toObject() {
		return {
			id: this.resource.id,
			label: this.resource.label,
			createdAt: this.resource.createdAt.toJSDate().toISOString(),
			lastUsedAt: this.resource.lastUsedAt?.toJSDate().toISOString() ?? null,
		};
	}
}
