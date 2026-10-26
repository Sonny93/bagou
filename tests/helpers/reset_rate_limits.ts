import limiter from '@adonisjs/limiter/services/main';

/** Empties the in-memory limiter store, meant for a group's `each.setup`. */
export async function resetRateLimits(): Promise<void> {
	await limiter.clear(['memory']);
}
