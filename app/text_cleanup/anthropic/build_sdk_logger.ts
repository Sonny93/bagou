import type { Logger } from '@adonisjs/core/logger';

type SdkLogFunction = (message: string, ...rest: unknown[]) => void;

export type SdkLogger = {
	error: SdkLogFunction;
	warn: SdkLogFunction;
	info: SdkLogFunction;
	debug: SdkLogFunction;
};

/**
 * Logger for the Anthropic SDK that keeps only the message string. The SDK
 * passes payloads as extra arguments (a malformed stream chunk is transcript
 * text), which the project never logs. Info and debug are dropped.
 */
export function buildSdkLogger(
	logger: Pick<Logger, 'error' | 'warn'>
): SdkLogger {
	const ignore: SdkLogFunction = () => undefined;
	return {
		error: (message) => logger.error(message),
		warn: (message) => logger.warn(message),
		info: ignore,
		debug: ignore,
	};
}
