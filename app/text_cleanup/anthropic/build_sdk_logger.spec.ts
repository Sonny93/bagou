import { test } from '@japa/runner';

import { buildSdkLogger } from '#text_cleanup/anthropic/build_sdk_logger';

type LoggerCall = {
	level: 'error' | 'warn' | 'info' | 'debug';
	args: unknown[];
};

function createStubLogger() {
	const calls: LoggerCall[] = [];
	const record =
		(level: LoggerCall['level']) =>
		(...args: unknown[]): void => {
			calls.push({ level, args });
		};
	const stub = {
		error: record('error'),
		warn: record('warn'),
		info: record('info'),
		debug: record('debug'),
	};
	return { stub, calls };
}

test.group('buildSdkLogger', () => {
	test('should forward only the message of warn and error calls', ({
		assert,
	}) => {
		const { stub, calls } = createStubLogger();
		const sdkLogger = buildSdkLogger(stub);

		sdkLogger.error('Could not parse message into JSON:', 'texte secret');
		sdkLogger.warn('Retrying', { body: 'texte secret' });

		assert.deepEqual(calls, [
			{ level: 'error', args: ['Could not parse message into JSON:'] },
			{ level: 'warn', args: ['Retrying'] },
		]);
	});

	test('should ignore info and debug calls', ({ assert }) => {
		const { stub, calls } = createStubLogger();
		const sdkLogger = buildSdkLogger(stub);

		sdkLogger.info('request', { body: 'texte secret' });
		sdkLogger.debug('request', { body: 'texte secret' });

		assert.lengthOf(calls, 0);
	});
});
