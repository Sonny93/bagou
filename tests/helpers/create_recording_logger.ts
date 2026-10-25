import { LoggerFactory } from '@adonisjs/core/factories/logger';

const LOGGER_NAME = 'spec';

/**
 * A real logger whose output lands in `lines` as raw JSON strings, so a spec
 * can assert on what was logged and, just as importantly, on what was not.
 */
export function createRecordingLogger() {
	const lines: string[] = [];
	const logger = new LoggerFactory()
		.merge({ enabled: true, name: LOGGER_NAME, level: 'info' })
		.pushLogsTo(lines)
		.create();
	return { logger, lines };
}
