import { test } from '@japa/runner';

import { parseDeepgramMessage } from '#transcription/providers/deepgram/parse_deepgram_message';

function buildResults(overrides: Record<string, unknown> = {}): string {
	return JSON.stringify({
		type: 'Results',
		is_final: true,
		channel: { alternatives: [{ transcript: 'bonjour' }] },
		...overrides,
	});
}

test.group('parseDeepgramMessage', () => {
	test('should parse a final result with its first alternative', ({
		assert,
	}) => {
		assert.deepEqual(parseDeepgramMessage(buildResults()), {
			type: 'results',
			isFinal: true,
			transcript: 'bonjour',
		});
	});

	test('should parse an interim result', ({ assert }) => {
		const message = parseDeepgramMessage(buildResults({ is_final: false }));

		assert.deepEqual(message, {
			type: 'results',
			isFinal: false,
			transcript: 'bonjour',
		});
	});

	test('should ignore a result without alternatives', ({ assert }) => {
		const raw = buildResults({ channel: { alternatives: [] } });

		assert.deepEqual(parseDeepgramMessage(raw), { type: 'ignored' });
	});

	test('should ignore a result whose is_final flag is not a boolean', ({
		assert,
	}) => {
		const raw = buildResults({ is_final: 'yes' });

		assert.deepEqual(parseDeepgramMessage(raw), { type: 'ignored' });
	});

	test('should ignore a result whose transcript is not a string', ({
		assert,
	}) => {
		const raw = buildResults({
			channel: { alternatives: [{ transcript: 4 }] },
		});

		assert.deepEqual(parseDeepgramMessage(raw), { type: 'ignored' });
	});

	test('should parse metadata, whatever it carries', ({ assert }) => {
		const raw = JSON.stringify({ type: 'Metadata', request_id: 'abc' });

		assert.deepEqual(parseDeepgramMessage(raw), { type: 'metadata' });
	});

	test('should parse a configure success', ({ assert }) => {
		const raw = JSON.stringify({ type: 'ConfigureSuccess', keyterms: ['a'] });

		assert.deepEqual(parseDeepgramMessage(raw), { type: 'configureSuccess' });
	});

	test('should parse a configure failure with its code', ({ assert }) => {
		const raw = JSON.stringify({
			type: 'ConfigureFailure',
			code: 'CONFIGURE_KEYTERM_LIMIT_EXCEEDED',
			description: 'too many',
		});

		assert.deepEqual(parseDeepgramMessage(raw), {
			type: 'configureFailure',
			code: 'CONFIGURE_KEYTERM_LIMIT_EXCEEDED',
		});
	});

	test('should fall back to an unknown code when a configure failure has none', ({
		assert,
	}) => {
		const raw = JSON.stringify({ type: 'ConfigureFailure' });

		assert.deepEqual(parseDeepgramMessage(raw), {
			type: 'configureFailure',
			code: 'unknown',
		});
	});

	test('should read only the variant of an error, never its description or echoed message', ({
		assert,
	}) => {
		const raw = JSON.stringify({
			type: 'Error',
			variant: 'SchemaError',
			description: 'invalid value "secret-term"',
			message: '{"keyterms":["secret-term"]}',
		});

		assert.deepEqual(parseDeepgramMessage(raw), {
			type: 'error',
			reason: 'SchemaError',
		});
	});

	test('should fall back to an unknown reason when an error has no variant', ({
		assert,
	}) => {
		const raw = JSON.stringify({ type: 'Error', description: 'secret-term' });

		assert.deepEqual(parseDeepgramMessage(raw), {
			type: 'error',
			reason: 'unknown error',
		});
	});

	test('should ignore unknown types, invalid JSON and non-objects', ({
		assert,
	}) => {
		const ignored = [
			'{"type":"SpeechStarted"}',
			'not json',
			'[]',
			'"text"',
		].map(parseDeepgramMessage);

		assert.deepEqual(ignored, Array(4).fill({ type: 'ignored' }));
	});
});
