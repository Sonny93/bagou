import Anthropic from '@anthropic-ai/sdk';
import { test } from '@japa/runner';

import {
	buildAnthropicMessage,
	buildCleanedTextMessage,
	buildTextBlock,
} from '#tests/helpers/build_anthropic_message';
import { FRENCH_CLEANUP_PREFERENCES } from '#tests/helpers/cleanup_preferences_fixture';
import { createRecordingLogger } from '#tests/helpers/create_recording_logger';
import { FakeMessagesApi } from '#tests/helpers/fake_messages_api';
import { AnthropicTextCleaner } from '#text_cleanup/anthropic/anthropic_text_cleaner';
import { buildAnthropicClient } from '#text_cleanup/anthropic/build_anthropic_client';
import { CLEANUP_MODELS } from '#text_cleanup/anthropic/cleanup_models';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';

const RAW_TEXT = 'euh secret transcript text';

function createCleaner(
	outcome: ConstructorParameters<typeof FakeMessagesApi>[0]
) {
	const api = new FakeMessagesApi(outcome);
	const { logger, lines } = createRecordingLogger();
	return { cleaner: new AnthropicTextCleaner(api, logger), api, lines };
}

const readLogs = (lines: readonly string[]): Record<string, unknown>[] =>
	lines.map((line) => JSON.parse(line));

const encoder = new TextEncoder();

const sseEvent = (event: string, data: unknown): Uint8Array =>
	encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

function brokenStreamResponse(): Response {
	const body = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(
				sseEvent('message_start', {
					type: 'message_start',
					message: buildAnthropicMessage(),
				})
			);
			controller.enqueue(
				sseEvent('content_block_start', {
					type: 'content_block_start',
					index: 0,
					content_block: { type: 'text', text: '', citations: null },
				})
			);
			controller.enqueue(
				sseEvent('content_block_delta', {
					type: 'content_block_delta',
					index: 0,
					delta: { type: 'text_delta', text: '{"cleaned_text":"Bon' },
				})
			);
			controller.error(new TypeError('terminated'));
		},
	});
	return new Response(body, {
		status: 200,
		headers: { 'content-type': 'text/event-stream' },
	});
}

function malformedChunkResponse(): Response {
	const body = [
		sseEvent('message_start', {
			type: 'message_start',
			message: buildAnthropicMessage(),
		}),
		encoder.encode(
			'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"text":"Mon diagnostic médical\n\n'
		),
	];
	return new Response(
		new ReadableStream<Uint8Array>({
			start(controller) {
				for (const chunk of body) controller.enqueue(chunk);
				controller.close();
			},
		}),
		{ status: 200, headers: { 'content-type': 'text/event-stream' } }
	);
}

const thinkingBlock = {
	type: 'thinking',
	thinking: 'hmm',
	signature: 'sig',
} as const;

test.group('AnthropicTextCleaner', () => {
	test('should send the transcript in tags with the model, low effort and no sampling parameters', async ({
		assert,
	}) => {
		const { cleaner, api } = createCleaner(buildCleanedTextMessage('ok'));

		await cleaner.clean(RAW_TEXT, FRENCH_CLEANUP_PREFERENCES);

		const [request] = api.requests;
		assert.equal(request?.model, CLEANUP_MODELS.standard.modelId);
		assert.equal(request?.output_config?.effort, 'low');
		assert.equal(request?.output_config?.format?.type, 'json_schema');
		assert.deepEqual(request?.messages, [
			{ role: 'user', content: `<transcript>\n${RAW_TEXT}\n</transcript>` },
		]);
		for (const forbidden of ['thinking', 'temperature', 'top_p', 'top_k']) {
			assert.notProperty(request, forbidden);
		}
	});

	test('should return cleaned_text and log model, duration and token usage', async ({
		assert,
	}) => {
		const { cleaner, lines } = createCleaner(
			buildCleanedTextMessage('Bonjour.')
		);

		const text = await cleaner.clean(RAW_TEXT, FRENCH_CLEANUP_PREFERENCES);

		assert.equal(text, 'Bonjour.');
		assert.include(readLogs(lines).at(-1), {
			model: CLEANUP_MODELS.standard.modelId,
			outcome: 'completed',
			inputTokens: 42,
			outputTokens: 17,
		});
		assert.property(readLogs(lines).at(-1), 'durationMs');
	});

	test('should log the model of the requested quality when the cleanup completes', async ({
		assert,
	}) => {
		const { cleaner, lines } = createCleaner(buildCleanedTextMessage('ok'));

		await cleaner.clean(RAW_TEXT, {
			...FRENCH_CLEANUP_PREFERENCES,
			quality: 'precise',
		});

		assert.equal(readLogs(lines).at(-1)?.model, CLEANUP_MODELS.precise.modelId);
	});

	test('should log the model of the requested quality when the cleanup fails', async ({
		assert,
	}) => {
		const { cleaner, lines } = createCleaner(
			buildAnthropicMessage({ stopReason: 'refusal' })
		);

		await assert.rejects(() =>
			cleaner.clean(RAW_TEXT, {
				...FRENCH_CLEANUP_PREFERENCES,
				quality: 'precise',
			})
		);

		assert.include(readLogs(lines).at(-1), {
			model: CLEANUP_MODELS.precise.modelId,
			kind: 'refusal',
		});
	});

	test('should expose the display name of the model of each quality', ({
		assert,
	}) => {
		const { cleaner } = createCleaner(buildCleanedTextMessage('ok'));

		assert.deepEqual(cleaner.modelNames, {
			standard: 'Claude Haiku 5.5',
			precise: 'Claude Sonnet 5.5',
		});
	});

	test('should report the output length without the JSON prefix for each text snapshot', async ({
		assert,
	}) => {
		const { cleaner } = createCleaner({
			snapshots: [
				'{"cleaned_text":"',
				'{"cleaned_text":"Bon',
				'{"cleaned_text":"Bonjour.',
			],
			result: buildCleanedTextMessage('Bonjour.'),
		});
		const lengths: number[] = [];

		await cleaner.clean(RAW_TEXT, FRENCH_CLEANUP_PREFERENCES, {
			onOutputLength: (characters) => lengths.push(characters),
		});

		assert.deepEqual(lengths, [0, 3, 8]);
	});

	test('should bound the whole answer with a signal that is not aborted yet', async ({
		assert,
	}) => {
		const { cleaner, api } = createCleaner(buildCleanedTextMessage('ok'));

		await cleaner.clean(RAW_TEXT, FRENCH_CLEANUP_PREFERENCES);

		assert.isFalse(api.signals[0]?.aborted);
	});

	test('should rethrow an error that does not come from the SDK', async ({
		assert,
	}) => {
		const { cleaner } = createCleaner(new TypeError('programming mistake'));

		await assert.rejects(
			() => cleaner.clean(RAW_TEXT, FRENCH_CLEANUP_PREFERENCES),
			'programming mistake'
		);
	});

	test('should fail as stream_error when the real SDK stream breaks mid-response', async ({
		assert,
	}) => {
		const { logger, lines } = createRecordingLogger();
		const client = new Anthropic({
			apiKey: 'test',
			maxRetries: 0,
			fetch: async () => brokenStreamResponse(),
		});
		const cleaner = new AnthropicTextCleaner(client, logger);

		await assert.rejects(
			() => cleaner.clean(RAW_TEXT, FRENCH_CLEANUP_PREFERENCES),
			new TextCleanupUnavailableException().message
		);

		assert.include(readLogs(lines).at(-1), { kind: 'stream_error' });
	});

	test('should not log the transcript text of a malformed stream chunk', async ({
		assert,
	}) => {
		const { logger, lines } = createRecordingLogger();
		const client = buildAnthropicClient(logger, {
			apiKey: 'test',
			maxRetries: 0,
			fetch: async () => malformedChunkResponse(),
		});
		const cleaner = new AnthropicTextCleaner(client, logger);

		await assert.rejects(
			() => cleaner.clean(RAW_TEXT, FRENCH_CLEANUP_PREFERENCES),
			new TextCleanupUnavailableException().message
		);

		assert.include(lines.join(''), 'Could not parse message into JSON:');
		assert.notInclude(lines.join(''), 'Mon diagnostic');
	});

	test('should read the text block even when thinking blocks come first', async ({
		assert,
	}) => {
		const { cleaner } = createCleaner(
			buildAnthropicMessage({
				content: [
					thinkingBlock,
					buildTextBlock(JSON.stringify({ cleaned_text: 'Salut.' })),
				],
			})
		);

		assert.equal(
			await cleaner.clean(RAW_TEXT, FRENCH_CLEANUP_PREFERENCES),
			'Salut.'
		);
	});

	test('should return an empty string when the model keeps nothing', async ({
		assert,
	}) => {
		const { cleaner } = createCleaner(buildCleanedTextMessage(''));

		assert.equal(await cleaner.clean(RAW_TEXT, FRENCH_CLEANUP_PREFERENCES), '');
	});

	test(
		'should throw the unavailable exception and log the failure kind when {kind}'
	)
		.with([
			{
				kind: 'refusal',
				outcome: buildAnthropicMessage({ stopReason: 'refusal' }),
			},
			{
				kind: 'max_tokens',
				outcome: buildAnthropicMessage({
					stopReason: 'max_tokens',
					content: [buildTextBlock('{"cleaned_text":"cut')],
				}),
			},
			{
				kind: 'missing_text',
				outcome: buildAnthropicMessage({ content: [thinkingBlock] }),
			},
			{
				kind: 'invalid_output',
				outcome: buildAnthropicMessage({
					content: [buildTextBlock('not json')],
				}),
			},
			{
				kind: 'invalid_output',
				outcome: buildAnthropicMessage({
					content: [buildTextBlock('{"cleaned_text":42}')],
				}),
			},
			{
				kind: 'api_error',
				outcome: new Anthropic.APIError(
					500,
					undefined,
					'secret provider text',
					undefined
				),
			},
			{
				kind: 'timeout',
				outcome: new Anthropic.APIUserAbortError({ message: 'secret abort' }),
			},
			{
				kind: 'stream_error',
				outcome: new Anthropic.AnthropicError('secret terminated'),
			},
			{
				kind: 'connection_error',
				outcome: new Anthropic.APIConnectionError({
					message: 'secret timeout',
				}),
			},
		])
		.run(async ({ assert }, { kind, outcome }) => {
			const { cleaner, lines } = createCleaner(outcome);

			await assert.rejects(
				() => cleaner.clean(RAW_TEXT, FRENCH_CLEANUP_PREFERENCES),
				new TextCleanupUnavailableException().message
			);

			assert.include(readLogs(lines).at(-1), { kind });
			assert.notInclude(lines.join(''), 'secret');
		});
});
