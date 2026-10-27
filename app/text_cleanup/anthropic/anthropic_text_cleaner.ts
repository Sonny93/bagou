import type { Logger } from '@adonisjs/core/logger';
import Anthropic from '@anthropic-ai/sdk';
import type {
	Message,
	MessageCreateParamsNonStreaming,
} from '@anthropic-ai/sdk/resources/messages';

import { buildCleanupRequest } from '#text_cleanup/anthropic/build_cleanup_request';
import { readCleanedText } from '#text_cleanup/anthropic/read_cleaned_text';
import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';
import { TextCleaner } from '#text_cleanup/text_cleaner';
import { TEXT_CLEANUP_MODEL } from '#text_cleanup/text_cleanup_model';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';

type CleanupFailureKind =
	| 'api_error'
	| 'connection_error'
	| 'refusal'
	| 'max_tokens'
	| 'missing_text'
	| 'invalid_output';

export type MessagesApi = {
	messages: {
		create(params: MessageCreateParamsNonStreaming): Promise<Message>;
	};
};

/**
 * Cleans text with Claude Haiku through structured output. Logs the model,
 * duration and token usage, and the failure kind on failure, never any text.
 */
export class AnthropicTextCleaner extends TextCleaner {
	constructor(
		private readonly client: MessagesApi,
		private readonly logger: Logger
	) {
		super();
	}

	async clean(
		text: string,
		preferences: Readonly<CleanupPreferences>
	): Promise<string> {
		const startedAt = Date.now();
		const message = await this.#send(text, preferences, startedAt);
		const cleanedText = this.#extractCleanedText(message, startedAt);
		this.logger.info(
			{
				model: TEXT_CLEANUP_MODEL,
				outcome: 'completed',
				durationMs: Date.now() - startedAt,
				inputTokens: message.usage.input_tokens,
				outputTokens: message.usage.output_tokens,
			},
			'Text cleanup completed'
		);
		return cleanedText;
	}

	async #send(
		text: string,
		preferences: Readonly<CleanupPreferences>,
		startedAt: number
	): Promise<Message> {
		try {
			return await this.client.messages.create(
				buildCleanupRequest(text, preferences)
			);
		} catch (error) {
			if (error instanceof Anthropic.APIConnectionError) {
				return this.#fail('connection_error', startedAt);
			}
			if (error instanceof Anthropic.APIError) {
				return this.#fail('api_error', startedAt);
			}
			throw error;
		}
	}

	#extractCleanedText(message: Message, startedAt: number): string {
		if (message.stop_reason === 'refusal') this.#fail('refusal', startedAt);
		if (message.stop_reason === 'max_tokens') {
			this.#fail('max_tokens', startedAt);
		}
		const textBlock = message.content.find((block) => block.type === 'text');
		if (!textBlock) return this.#fail('missing_text', startedAt);
		const cleanedText = readCleanedText(textBlock.text);
		if (cleanedText === undefined) {
			return this.#fail('invalid_output', startedAt);
		}
		return cleanedText;
	}

	#fail(kind: CleanupFailureKind, startedAt: number): never {
		this.logger.warn(
			{
				model: TEXT_CLEANUP_MODEL,
				kind,
				durationMs: Date.now() - startedAt,
			},
			'Text cleanup failed'
		);
		throw new TextCleanupUnavailableException();
	}
}
