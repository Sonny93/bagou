import type {
	ContentBlock,
	Message,
	StopReason,
} from '@anthropic-ai/sdk/resources/messages';

import { TEXT_CLEANUP_MODEL } from '#text_cleanup/text_cleanup_model';

type AnthropicMessageOverrides = {
	content?: ContentBlock[];
	stopReason?: StopReason;
};

export const buildTextBlock = (text: string): ContentBlock => ({
	type: 'text',
	text,
	citations: null,
});

export const buildCleanedTextMessage = (cleanedText: string): Message =>
	buildAnthropicMessage({
		content: [buildTextBlock(JSON.stringify({ cleaned_text: cleanedText }))],
	});

export const buildAnthropicMessage = ({
	content = [],
	stopReason = 'end_turn',
}: Readonly<AnthropicMessageOverrides> = {}): Message => ({
	id: 'msg_fake',
	container: null,
	content,
	diagnostics: null,
	model: TEXT_CLEANUP_MODEL,
	role: 'assistant',
	stop_details: null,
	stop_reason: stopReason,
	stop_sequence: null,
	type: 'message',
	usage: {
		cache_creation: null,
		cache_creation_input_tokens: null,
		cache_read_input_tokens: null,
		inference_geo: null,
		input_tokens: 42,
		output_tokens: 17,
		output_tokens_details: null,
		server_tool_use: null,
		service_tier: null,
		speed: null,
	},
});
