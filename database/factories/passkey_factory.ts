import Factory from '@adonisjs/lucid/factories';

import { UserFactory } from '#database/factories/user_factory';
import Passkey from '#passkeys/passkey';

export const PasskeyFactory = Factory.define(Passkey, ({ faker }) => ({
	credentialId: faker.string.alphanumeric({ length: 43 }),
	publicKey: Buffer.from(faker.string.alphanumeric({ length: 77 })),
	counter: 0,
	transports: ['internal'],
	deviceType: 'multiDevice',
	backedUp: true,
	label: faker.commerce.productName(),
	lastUsedAt: null,
}))
	.relation('user', () => UserFactory)
	.build();
