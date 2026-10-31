import type { ApplicationService } from '@adonisjs/core/types';

import env from '#start/env';
import { AnthropicTextCleaner } from '#text_cleanup/anthropic/anthropic_text_cleaner';
import { buildAnthropicClient } from '#text_cleanup/anthropic/build_anthropic_client';
import { TextCleaner } from '#text_cleanup/text_cleaner';

/** Bounds the wait for the response headers of each attempt; the streamed answer has its own bound in the adapter. */
const RESPONSE_HEADERS_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 1;

/**
 * Binds the text cleanup port to its single adapter. Swapping engine means
 * changing this one binding; nothing else in the app knows the adapter.
 */
export default class TextCleanupAppProvider {
	constructor(protected app: ApplicationService) {}

	register(): void {
		this.app.container.singleton(TextCleaner, async (resolver) => {
			const logger = await resolver.make('logger');
			const client = buildAnthropicClient(logger, {
				apiKey: env.get('ANTHROPIC_API_KEY'),
				timeout: RESPONSE_HEADERS_TIMEOUT_MS,
				maxRetries: MAX_RETRIES,
			});
			return new AnthropicTextCleaner(client, logger);
		});
	}
}
