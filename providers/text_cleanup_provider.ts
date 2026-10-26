import type { ApplicationService } from '@adonisjs/core/types';
import Anthropic from '@anthropic-ai/sdk';

import env from '#start/env';
import { AnthropicTextCleaner } from '#text_cleanup/anthropic/anthropic_text_cleaner';
import { TextCleaner } from '#text_cleanup/text_cleaner';

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 1;

/**
 * Binds the text cleanup port to its single adapter. Swapping engine means
 * changing this one binding; nothing else in the app knows the adapter.
 */
export default class TextCleanupAppProvider {
	constructor(protected app: ApplicationService) {}

	register(): void {
		this.app.container.singleton(TextCleaner, async (resolver) => {
			const client = new Anthropic({
				apiKey: env.get('ANTHROPIC_API_KEY'),
				timeout: REQUEST_TIMEOUT_MS,
				maxRetries: MAX_RETRIES,
			});
			return new AnthropicTextCleaner(client, await resolver.make('logger'));
		});
	}
}
