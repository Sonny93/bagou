import type { HttpContext } from '@adonisjs/core/http';
import limiter from '@adonisjs/limiter/services/main';

const RATE_LIMIT_MESSAGE = 'Trop de requêtes, patiente une minute';
const WINDOW = '1 minute';
const AUTH_REQUESTS_PER_WINDOW = 10;
const CLEANUP_REQUESTS_PER_WINDOW = 30;

type LimiterKeyType = 'ip' | 'user';

function reportRateLimitHit(
	ctx: HttpContext,
	limiterName: string,
	keyType: LimiterKeyType
): void {
	ctx.logger.warn({ limiter: limiterName, keyType }, 'Rate limit hit');
}

/** Passkey ceremonies of guests, shared by all of them, keyed by IP. */
export const authThrottle = limiter.define('auth', (ctx) =>
	limiter
		.allowRequests(AUTH_REQUESTS_PER_WINDOW)
		.every(WINDOW)
		.limitExceeded((error) => {
			error.setMessage(RATE_LIMIT_MESSAGE);
			reportRateLimitHit(ctx, 'auth', 'ip');
		})
);

/** Text cleanup calls, keyed by the authenticated user. */
export const cleanupThrottle = limiter.define('cleanup', (ctx) =>
	limiter
		.allowRequests(CLEANUP_REQUESTS_PER_WINDOW)
		.every(WINDOW)
		.usingKey(ctx.auth.getUserOrFail().id)
		.limitExceeded((error) => {
			error.setMessage(RATE_LIMIT_MESSAGE);
			reportRateLimitHit(ctx, 'cleanup', 'user');
		})
);
