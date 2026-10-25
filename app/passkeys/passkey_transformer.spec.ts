import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import { PasskeyFactory } from '#database/factories/passkey_factory';
import PasskeyTransformer from '#passkeys/passkey_transformer';

test.group('PasskeyTransformer', () => {
	test('should expose the label and dates but never the key material', async ({
		assert,
	}) => {
		const lastUsedAt = DateTime.fromISO('2026-01-02T03:04:05.000Z');
		const passkey = await PasskeyFactory.merge({
			id: 3,
			label: 'MacBook',
			createdAt: DateTime.fromISO('2026-01-01T00:00:00.000Z'),
			lastUsedAt,
		}).makeStubbed();

		const output = new PasskeyTransformer(passkey).toObject();

		assert.deepEqual(output, {
			id: 3,
			label: 'MacBook',
			createdAt: '2026-01-01T00:00:00.000Z',
			lastUsedAt: '2026-01-02T03:04:05.000Z',
		});
	});
});
