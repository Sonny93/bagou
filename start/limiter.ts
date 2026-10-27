import type { HttpContext } from '@adonisjs/core/http';
import limiter from '@adonisjs/limiter/services/main';

/** The limiter answers `errors[].message`: the stable code, translated by the browser. */
const RATE_LIMIT_MESSAGE = 'E_TOO_MANY_REQUESTS';
const WINDOW = '1 minute';
const AUTH_REQUESTS_PER_WINDOW = 10;
const CLEANUP_REQUESTS_PER_WINDOW = 10;

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

/** Each on-demand cleanup spends text cleanup credits, so it is capped per user. */
export const cleanupThrottle = limiter.define('cleanup', (ctx) =>
	limiter
		.allowRequests(CLEANUP_REQUESTS_PER_WINDOW)
		.every(WINDOW)
		.usingKey(`user_${ctx.auth.getUserOrFail().id}`)
		.limitExceeded((error) => {
			error.setMessage(RATE_LIMIT_MESSAGE);
			reportRateLimitHit(ctx, 'cleanup', 'user');
		})
);
