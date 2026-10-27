import type { FakeTranscriptionSession } from '#tests/helpers/fake_transcription_session';
import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import { TranscriptionProvider } from '#transcription/transcription_provider';
import type { TranscriptionSession } from '#transcription/transcription_session';

/**
 * Opens its session only once a spec calls `release()`, to play a provider
 * that is slow to be ready.
 */
export class SlowTranscriptionProvider extends TranscriptionProvider {
	readonly name = 'slow';
	#release: () => void = () => undefined;

	constructor(private readonly session: FakeTranscriptionSession) {
		super();
	}

	async open(
		_options: Readonly<OpenTranscriptionOptions>
	): Promise<TranscriptionSession> {
		await new Promise<void>((resolve) => {
			this.#release = resolve;
		});
		return this.session;
	}

	release(): void {
		this.#release();
	}
}
