import { defineConfig, targets } from '@adonisjs/core/logger';
import app from '@adonisjs/core/services/app';

import env from '#start/env';

const LOGGER_NAME = 'bagou';

const loggerConfig = defineConfig({
	default: 'app',

	loggers: {
		app: {
			enabled: true,
			name: LOGGER_NAME,
			level: env.get('LOG_LEVEL'),
			transport: {
				targets: targets()
					.pushIf(!app.inProduction, targets.pretty())
					.pushIf(app.inProduction, targets.file({ destination: 1 }))
					.toArray(),
			},
		},
	},
});

export default loggerConfig;

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
	export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
