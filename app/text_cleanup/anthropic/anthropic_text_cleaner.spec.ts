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
import { TEXT_CLEANUP_MODEL } from '#text_cleanup/text_cleanup_model';
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
		assert.equal(request?.model, TEXT_CLEANUP_MODEL);
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
			model: TEXT_CLEANUP_MODEL,
			outcome: 'completed',
			inputTokens: 42,
			outputTokens: 17,
		});
		assert.property(readLogs(lines).at(-1), 'durationMs');
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
