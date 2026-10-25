import { FakeTranscriptionSession } from '#tests/helpers/fake_transcription_session';
import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import { TranscriptionProvider } from '#transcription/transcription_provider';
import type { TranscriptionSession } from '#transcription/transcription_session';

/**
 * Hands out one pre-built fake session, or fails to open when given an error.
 */
export class FakeTranscriptionProvider extends TranscriptionProvider {
	readonly name = 'fake';
	readonly openedWith: OpenTranscriptionOptions[] = [];

	constructor(
		readonly session: FakeTranscriptionSession = new FakeTranscriptionSession(),
		private readonly openError?: Error
	) {
		super();
	}

	async open(
		options: Readonly<OpenTranscriptionOptions>
	): Promise<TranscriptionSession> {
		this.openedWith.push(options);
		if (this.openError) throw this.openError;
		return this.session;
	}
}
