import app from '@adonisjs/core/services/app';
import { defineConfig, stores } from '@adonisjs/limiter';

/**
 * Rate limit counters live in Postgres. Tests use the in-process memory
 * store instead, which a spec can reset between tests.
 */
const LIMITER_STORE = app.inTest ? 'memory' : 'database';

const limiterConfig = defineConfig({
	default: LIMITER_STORE,
	stores: {
		database: stores.database({ tableName: 'rate_limits' }),
		memory: stores.memory({}),
	},
});

export default limiterConfig;

declare module '@adonisjs/limiter/types' {
	export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
