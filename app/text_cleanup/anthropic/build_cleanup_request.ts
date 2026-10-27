import type { MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/messages';

import { buildSystemPrompt } from '#text_cleanup/anthropic/build_system_prompt';
import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';
import { TEXT_CLEANUP_MODEL } from '#text_cleanup/text_cleanup_model';

const MAX_OUTPUT_TOKENS = 16_000;

const OUTPUT_SCHEMA = {
	type: 'object',
	properties: { cleaned_text: { type: 'string' } },
	required: ['cleaned_text'],
	additionalProperties: false,
};

export function buildCleanupRequest(
	text: string,
	preferences: Readonly<CleanupPreferences>
): MessageCreateParamsNonStreaming {
	return {
		model: TEXT_CLEANUP_MODEL,
		max_tokens: MAX_OUTPUT_TOKENS,
		system: buildSystemPrompt(preferences),
		messages: [
			{ role: 'user', content: `<transcript>\n${text}\n</transcript>` },
		],
		output_config: {
			effort: 'low',
			format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
		},
	};
}
