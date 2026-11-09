import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import { DeepgramTranscriptionSession } from '#transcription/providers/deepgram/deepgram_transcription_session';
import type { WebSocketFactory } from '#transcription/realtime_socket/web_socket_factory';
import { TranscriptionProvider } from '#transcription/transcription_provider';
import type { TranscriptionSession } from '#transcription/transcription_session';
import type { WarningLogger } from '#transcription/warning_logger';

const LISTEN_ENDPOINT = 'wss://api.deepgram.com/v1/listen';
export const DEEPGRAM_MODEL = 'nova-3';
const PCM_ENCODING = 'linear16';

/**
 * Keyterms are deliberately not in the URL (they are sent through a Configure
 * message), and `mip_opt_out` always keeps the audio out of Deepgram's model
 * improvement program.
 */
export class DeepgramTranscriptionProvider extends TranscriptionProvider {
	readonly name = 'deepgram';

	constructor(
		private readonly apiKey: string,
		private readonly createSocket: WebSocketFactory,
		private readonly logger: WarningLogger
	) {
		super();
	}

	async open(
		options: Readonly<OpenTranscriptionOptions>
	): Promise<TranscriptionSession> {
		const socket = this.createSocket(this.#buildUrl(options), {
			Authorization: `Token ${this.apiKey}`,
		});
		const session = new DeepgramTranscriptionSession(
			socket,
			options,
			this.logger
		);
		await session.waitUntilReady();
		return session;
	}

	#buildUrl(options: Readonly<OpenTranscriptionOptions>): string {
		const url = new URL(LISTEN_ENDPOINT);
		url.searchParams.set('model', DEEPGRAM_MODEL);
		url.searchParams.set('language', options.language);
		url.searchParams.set('encoding', PCM_ENCODING);
		url.searchParams.set('sample_rate', String(PCM_AUDIO_FORMAT.sampleRateHz));
		url.searchParams.set('channels', String(PCM_AUDIO_FORMAT.channelCount));
		url.searchParams.set('interim_results', 'true');
		url.searchParams.set('smart_format', 'true');
		url.searchParams.set('mip_opt_out', 'true');
		return url.href;
	}
}
