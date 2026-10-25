import Factory from '@adonisjs/lucid/factories';
import { DateTime } from 'luxon';

import PasskeyInvitation from '#passkeys/passkey_invitation';

export const PasskeyInvitationFactory = Factory.define(
	PasskeyInvitation,
	({ faker }) => ({
		tokenHash: faker.string.hexadecimal({
			length: 64,
			prefix: '',
			casing: 'lower',
		}),
		expiresAt: DateTime.now().plus({ minutes: 15 }),
		usedAt: null,
	})
).build();
