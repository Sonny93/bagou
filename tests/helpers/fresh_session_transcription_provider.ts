import { FakeTranscriptionSession } from '#tests/helpers/fake_transcription_session';
import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import { TranscriptionProvider } from '#transcription/transcription_provider';
import type { TranscriptionSession } from '#transcription/transcription_session';

/**
 * Hands out a new fake session on every open, like a real provider, for specs
 * that run many dictations in a row.
 */
export class FreshSessionTranscriptionProvider extends TranscriptionProvider {
	readonly name = 'fresh';
	readonly openedWith: OpenTranscriptionOptions[] = [];

	async open(
		options: Readonly<OpenTranscriptionOptions>
	): Promise<TranscriptionSession> {
		this.openedWith.push(options);
		return new FakeTranscriptionSession();
	}
}
