import type { Logger } from '@adonisjs/core/logger';
import Anthropic from '@anthropic-ai/sdk';
import type {
	Message,
	MessageStreamParams,
} from '@anthropic-ai/sdk/resources/messages/messages';

import { buildCleanupRequest } from '#text_cleanup/anthropic/build_cleanup_request';
import { readCleanedText } from '#text_cleanup/anthropic/read_cleaned_text';
import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';
import { TextCleaner } from '#text_cleanup/text_cleaner';
import type { TextCleanOptions } from '#text_cleanup/text_cleaner';
import { TEXT_CLEANUP_MODEL } from '#text_cleanup/text_cleanup_model';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';

const CLEANUP_TIMEOUT_MS = 30_000;
const JSON_PREFIX_LENGTH = '{"cleaned_text":"'.length;

type CleanupFailureKind =
	| 'timeout'
	| 'api_error'
	| 'connection_error'
	| 'stream_error'
	| 'refusal'
	| 'max_tokens'
	| 'missing_text'
	| 'invalid_output';

export type CleanupStream = {
	on(
		event: 'text',
		listener: (delta: string, snapshot: string) => void
	): unknown;
	finalMessage(): Promise<Message>;
};

export type MessagesApi = {
	messages: {
		stream(
			params: MessageStreamParams,
			options: { signal: AbortSignal }
		): CleanupStream;
	};
};

/**
 * Cleans text with Claude Haiku through structured output, streamed so the
 * output length can be reported while it is produced; the cleaned text itself
 * is only read from the final message. The whole answer is bounded by
 * `CLEANUP_TIMEOUT_MS`. Logs the model, duration and token usage, and the
 * failure kind on failure, never any text.
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
		preferences: Readonly<CleanupPreferences>,
		options?: Readonly<TextCleanOptions>
	): Promise<string> {
		const startedAt = Date.now();
		const message = await this.#send(text, preferences, options, startedAt);
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
		options: Readonly<TextCleanOptions> | undefined,
		startedAt: number
	): Promise<Message> {
		const signal = AbortSignal.timeout(CLEANUP_TIMEOUT_MS);
		try {
			const stream = this.client.messages.stream(
				buildCleanupRequest(text, preferences),
				{ signal }
			);
			const finalMessage = stream.finalMessage();
			stream.on('text', (_delta, snapshot) => {
				options?.onOutputLength?.(
					Math.max(0, snapshot.length - JSON_PREFIX_LENGTH)
				);
			});
			return await finalMessage;
		} catch (error) {
			return this.#failFromError(error, signal, startedAt);
		}
	}

	#failFromError(
		error: unknown,
		signal: AbortSignal,
		startedAt: number
	): never {
		if (signal.aborted || error instanceof Anthropic.APIUserAbortError) {
			return this.#fail('timeout', startedAt);
		}
		if (error instanceof Anthropic.APIConnectionError) {
			return this.#fail('connection_error', startedAt);
		}
		if (error instanceof Anthropic.APIError) {
			return this.#fail('api_error', startedAt);
		}
		if (error instanceof Anthropic.AnthropicError) {
			return this.#fail('stream_error', startedAt);
		}
		throw error;
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
