import { test } from '@japa/runner';

import { createRecordingLogger } from '#tests/helpers/create_recording_logger';
import { buildAnthropicClient } from '#text_cleanup/anthropic/build_anthropic_client';

const CLIENT_OPTIONS = { apiKey: 'test', maxRetries: 0 } as const;

test.group('buildAnthropicClient', () => {
	test('should send the SDK logs to the app logger instead of the console', ({
		assert,
	}) => {
		const { logger, lines } = createRecordingLogger();

		buildAnthropicClient(logger, CLIENT_OPTIONS).logger.warn('sdk warning');

		const [line] = lines.map((entry) => JSON.parse(entry));
		assert.equal(line?.msg, 'sdk warning');
	});

	test('should ignore the ANTHROPIC_LOG environment variable', ({ assert }) => {
		const previous = process.env['ANTHROPIC_LOG'];
		process.env['ANTHROPIC_LOG'] = 'debug';
		const { logger } = createRecordingLogger();

		const client = buildAnthropicClient(logger, CLIENT_OPTIONS);

		if (previous === undefined) delete process.env['ANTHROPIC_LOG'];
		else process.env['ANTHROPIC_LOG'] = previous;
		assert.equal(client.logLevel, 'warn');
	});
});
