import type { DeepgramServerMessage } from '#transcription/providers/deepgram/deepgram_server_message';

const UNKNOWN_CODE = 'unknown';
const UNKNOWN_ERROR_REASON = 'unknown error';

const IGNORED: DeepgramServerMessage = { type: 'ignored' };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readFirstTranscript(
	message: Record<string, unknown>
): string | undefined {
	const { channel } = message;
	if (!isRecord(channel) || !Array.isArray(channel.alternatives)) return;
	const [firstAlternative] = channel.alternatives;
	if (!isRecord(firstAlternative)) return;
	const { transcript } = firstAlternative;
	return typeof transcript === 'string' ? transcript : undefined;
}

function parseResults(message: Record<string, unknown>): DeepgramServerMessage {
	const transcript = readFirstTranscript(message);
	if (transcript === undefined || typeof message.is_final !== 'boolean') {
		return IGNORED;
	}
	return { type: 'results', isFinal: message.is_final, transcript };
}

/**
 * Only the `variant` may reach the logs: the `message` field echoes the payload
 * that caused the error (keyterms included) and the `description` can quote
 * deserialized values.
 */
function readErrorReason(message: Record<string, unknown>): string {
	return typeof message.variant === 'string'
		? message.variant
		: UNKNOWN_ERROR_REASON;
}

/**
 * Narrows one raw text frame from Deepgram. Anything unexpected (invalid JSON,
 * unknown types such as SpeechStarted, malformed payloads) maps to `ignored`.
 */
export function parseDeepgramMessage(raw: string): DeepgramServerMessage {
	let message: unknown;
	try {
		message = JSON.parse(raw);
	} catch {
		return IGNORED;
	}
	if (!isRecord(message)) return IGNORED;

	switch (message.type) {
		case 'Results':
			return parseResults(message);
		case 'Metadata':
			return { type: 'metadata' };
		case 'ConfigureSuccess':
			return { type: 'configureSuccess' };
		case 'ConfigureFailure':
			return {
				type: 'configureFailure',
				code: typeof message.code === 'string' ? message.code : UNKNOWN_CODE,
			};
		case 'Error':
			return { type: 'error', reason: readErrorReason(message) };
		default:
			return IGNORED;
	}
}
