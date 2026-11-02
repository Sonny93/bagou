import { test } from '@japa/runner';

import { FRENCH_CLEANUP_PREFERENCES } from '#tests/helpers/cleanup_preferences_fixture';
import { buildCleanupRequest } from '#text_cleanup/anthropic/build_cleanup_request';
import { CLEANUP_MODELS } from '#text_cleanup/anthropic/cleanup_models';

test.group('buildCleanupRequest', () => {
	test('should use the Haiku model when the quality is standard', ({
		assert,
	}) => {
		const request = buildCleanupRequest('bonjour', {
			...FRENCH_CLEANUP_PREFERENCES,
			quality: 'standard',
		});

		assert.equal(request.model, 'claude-haiku-5-5');
		assert.equal(request.model, CLEANUP_MODELS.standard.modelId);
	});

	test('should use the Sonnet model when the quality is precise', ({
		assert,
	}) => {
		const request = buildCleanupRequest('bonjour', {
			...FRENCH_CLEANUP_PREFERENCES,
			quality: 'precise',
		});

		assert.equal(request.model, 'claude-sonnet-5-5');
	});
});
