import { test } from '@japa/runner';

import { selectProviderNames } from '#stt_bench/select_provider_names';

const registeredNames = ['mistral', 'deepgram'];

test.group('selectProviderNames', () => {
	test('should default to the bound provider', ({ assert }) => {
		assert.deepEqual(
			selectProviderNames({
				requestedName: undefined,
				boundName: 'mistral',
				registeredNames,
			}),
			['mistral']
		);
	});

	test('should select every registered provider for "all"', ({ assert }) => {
		assert.deepEqual(
			selectProviderNames({
				requestedName: 'all',
				boundName: 'mistral',
				registeredNames,
			}),
			registeredNames
		);
	});

	test('should fail for an unregistered provider', ({ assert }) => {
		assert.throws(
			() =>
				selectProviderNames({
					requestedName: 'whisper',
					boundName: 'mistral',
					registeredNames,
				}),
			/Unknown provider "whisper"/
		);
	});
});
