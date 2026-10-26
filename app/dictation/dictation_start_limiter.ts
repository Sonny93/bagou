import { inject } from '@adonisjs/core';
import { Logger } from '@adonisjs/core/logger';
import { errors } from '@adonisjs/limiter';
import limiter from '@adonisjs/limiter/services/main';

import DictationRateLimitedException from '#dictation/dictation_rate_limited_exception';

const START_REQUESTS_PER_WINDOW = 20;
const START_WINDOW = '1 minute';

/** Caps how often one user may open dictation sessions on the provider. */
@inject()
export class DictationStartLimiter {
	constructor(private readonly logger: Logger) {}

	async consume(userId: number): Promise<void> {
		const startLimiter = limiter.use({
			requests: START_REQUESTS_PER_WINDOW,
			duration: START_WINDOW,
		});
		try {
			await startLimiter.consume(`dictation_start_${userId}`);
		} catch (error) {
			if (!(error instanceof errors.E_TOO_MANY_REQUESTS)) throw error;
			this.logger.warn(
				{ limiter: 'dictation_start', keyType: 'user' },
				'Rate limit hit'
			);
			throw new DictationRateLimitedException();
		}
	}
}
