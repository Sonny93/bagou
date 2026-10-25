import type { MistralServerMessage } from '#transcription/providers/mistral/mistral_server_message';

const UNKNOWN_ERROR_MESSAGE = 'unknown error';

const IGNORED: MistralServerMessage = { type: 'ignored' };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(message: Record<string, unknown>): string | undefined {
	return typeof message.text === 'string' ? message.text : undefined;
}

function readErrorMessage(message: Record<string, unknown>): string {
	const { error } = message;
	if (isRecord(error) && typeof error.message === 'string')
		return error.message;
	return UNKNOWN_ERROR_MESSAGE;
}

/**
 * Narrows one raw text frame from Mistral. Anything unexpected (invalid JSON,
 * unknown event types, turn events, malformed payloads) maps to `ignored`.
 */
export function parseMistralMessage(raw: string): MistralServerMessage {
	let message: unknown;
	try {
		message = JSON.parse(raw);
	} catch {
		return IGNORED;
	}
	if (!isRecord(message)) return IGNORED;

	switch (message.type) {
		case 'session.created':
		case 'session.updated':
			return { type: message.type };
		case 'transcription.text.delta':
		case 'transcription.done': {
			const text = readText(message);
			return text === undefined ? IGNORED : { type: message.type, text };
		}
		case 'error':
			return { type: 'error', message: readErrorMessage(message) };
		default:
			return IGNORED;
	}
}
