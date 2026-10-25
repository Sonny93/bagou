import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import type { TranscriptionSession } from '#transcription/transcription_session';

/**
 * Port to a speech-to-text provider. An abstract class so it can serve as the
 * container token (types do not exist at runtime); one adapter per provider
 * lives in `providers/<name>/`, and the rest of the app only knows this port.
 */
export abstract class TranscriptionProvider {
	abstract readonly name: string;

	/** Resolves once the provider session is configured and ready for audio. */
	abstract open(
		options: Readonly<OpenTranscriptionOptions>
	): Promise<TranscriptionSession>;
}
