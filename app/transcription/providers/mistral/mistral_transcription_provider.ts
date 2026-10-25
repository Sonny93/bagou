import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import { MistralTranscriptionSession } from '#transcription/providers/mistral/mistral_transcription_session';
import type { WebSocketFactory } from '#transcription/providers/mistral/web_socket_factory';
import { TranscriptionProvider } from '#transcription/transcription_provider';
import type { TranscriptionSession } from '#transcription/transcription_session';

const REALTIME_ENDPOINT =
	'wss://api.mistral.ai/v1/audio/transcriptions/realtime';
export const MISTRAL_REALTIME_MODEL = 'voxtral-mini-transcribe-realtime-3-0';

export class MistralTranscriptionProvider extends TranscriptionProvider {
	readonly name = 'mistral';

	constructor(
		private readonly apiKey: string,
		private readonly createSocket: WebSocketFactory
	) {
		super();
	}

	async open(
		options: Readonly<OpenTranscriptionOptions>
	): Promise<TranscriptionSession> {
		const url = new URL(REALTIME_ENDPOINT);
		url.searchParams.set('model', MISTRAL_REALTIME_MODEL);
		const socket = this.createSocket(url.href, {
			Authorization: `Bearer ${this.apiKey}`,
		});
		const session = new MistralTranscriptionSession(socket, options);
		await session.waitUntilReady();
		return session;
	}
}
