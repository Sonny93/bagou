import type { Logger } from '@adonisjs/core/logger';
import Anthropic from '@anthropic-ai/sdk';
import type {
	Message,
	MessageStreamParams,
} from '@anthropic-ai/sdk/resources/messages/messages';

import { buildCleanupRequest } from '#text_cleanup/anthropic/build_cleanup_request';
import { CLEANUP_MODELS } from '#text_cleanup/anthropic/cleanup_models';
import { readCleanedText } from '#text_cleanup/anthropic/read_cleaned_text';
import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';
import type { CleanupQuality } from '#text_cleanup/cleanup_quality';
import { TextCleaner } from '#text_cleanup/text_cleaner';
import type { TextCleanOptions } from '#text_cleanup/text_cleaner';
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

type CleanupAttempt = {
	readonly modelId: string;
	readonly startedAt: number;
};

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
 * Cleans text with the Claude model of the requested quality through structured output, streamed so the
 * output length can be reported while it is produced; the cleaned text itself
 * is only read from the final message. The whole answer is bounded by
 * `CLEANUP_TIMEOUT_MS`. Logs the model, duration and token usage, and the
 * failure kind on failure, never any text.
 */
export class AnthropicTextCleaner extends TextCleaner {
	readonly modelNames: Readonly<Record<CleanupQuality, string>> = {
		standard: CLEANUP_MODELS.standard.displayName,
		precise: CLEANUP_MODELS.precise.displayName,
	};

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
		const attempt: CleanupAttempt = {
			modelId: CLEANUP_MODELS[preferences.quality].modelId,
			startedAt: Date.now(),
		};
		const message = await this.#send(text, preferences, options, attempt);
		const cleanedText = this.#extractCleanedText(message, attempt);
		this.logger.info(
			{
				model: attempt.modelId,
				outcome: 'completed',
				durationMs: Date.now() - attempt.startedAt,
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
		attempt: CleanupAttempt
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
			return this.#failFromError(error, signal, attempt);
		}
	}

	#failFromError(
		error: unknown,
		signal: AbortSignal,
		attempt: CleanupAttempt
	): never {
		if (signal.aborted || error instanceof Anthropic.APIUserAbortError) {
			return this.#fail('timeout', attempt);
		}
		if (error instanceof Anthropic.APIConnectionError) {
			return this.#fail('connection_error', attempt);
		}
		if (error instanceof Anthropic.APIError) {
			return this.#fail('api_error', attempt);
		}
		if (error instanceof Anthropic.AnthropicError) {
			return this.#fail('stream_error', attempt);
		}
		throw error;
	}

	#extractCleanedText(message: Message, attempt: CleanupAttempt): string {
		if (message.stop_reason === 'refusal') this.#fail('refusal', attempt);
		if (message.stop_reason === 'max_tokens') {
			this.#fail('max_tokens', attempt);
		}
		const textBlock = message.content.find((block) => block.type === 'text');
		if (!textBlock) return this.#fail('missing_text', attempt);
		const cleanedText = readCleanedText(textBlock.text);
		if (cleanedText === undefined) {
			return this.#fail('invalid_output', attempt);
		}
		return cleanedText;
	}

	#fail(kind: CleanupFailureKind, attempt: CleanupAttempt): never {
		this.logger.warn(
			{
				model: attempt.modelId,
				kind,
				durationMs: Date.now() - attempt.startedAt,
			},
			'Text cleanup failed'
		);
		throw new TextCleanupUnavailableException();
	}
}
