import { test } from '@japa/runner';

import { skipUnconfiguredProviders } from '#stt_bench/skip_unconfigured_providers';

test.group('skipUnconfiguredProviders', () => {
	test('should keep the providers with a key and skip the others', ({
		assert,
	}) => {
		const split = skipUnconfiguredProviders({
			providerNames: ['mistral', 'deepgram'],
			isConfigured: (name) => name === 'deepgram',
		});

		assert.deepEqual(split, {
			configuredNames: ['deepgram'],
			skippedNames: ['mistral'],
		});
	});

	test('should skip nothing when every provider has a key', ({ assert }) => {
		const split = skipUnconfiguredProviders({
			providerNames: ['mistral', 'deepgram'],
			isConfigured: () => true,
		});

		assert.deepEqual(split, {
			configuredNames: ['mistral', 'deepgram'],
			skippedNames: [],
		});
	});

	test('should leave no provider when none has a key', ({ assert }) => {
		const split = skipUnconfiguredProviders({
			providerNames: ['mistral', 'deepgram'],
			isConfigured: () => false,
		});

		assert.deepEqual(split.configuredNames, []);
	});
});
