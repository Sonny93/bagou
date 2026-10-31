import type { Logger } from '@adonisjs/core/logger';
import Anthropic from '@anthropic-ai/sdk';
import type { ClientOptions } from '@anthropic-ai/sdk';

import { buildSdkLogger } from '#text_cleanup/anthropic/build_sdk_logger';

type AnthropicClientOptions = Partial<
	Pick<ClientOptions, 'apiKey' | 'timeout' | 'maxRetries' | 'fetch'>
>;

/**
 * The only way the app builds an Anthropic client: its logs go through the
 * app logger as bare messages (see `buildSdkLogger`) and `ANTHROPIC_LOG`
 * cannot raise the level, since `debug` would log request bodies.
 */
export function buildAnthropicClient(
	logger: Logger,
	options: Readonly<AnthropicClientOptions>
): Anthropic {
	return new Anthropic({
		...options,
		logLevel: 'warn',
		logger: buildSdkLogger(logger),
	});
}
