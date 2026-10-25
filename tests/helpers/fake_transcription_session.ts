import type { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import { TranscriptionSession } from '#transcription/transcription_session';

/**
 * In-memory session: records what it is given and lets a spec push provider
 * events by hand.
 */
export class FakeTranscriptionSession extends TranscriptionSession {
	readonly sentAudio: Uint8Array[] = [];
	finishCount = 0;
	abortCount = 0;

	constructor(private readonly finalText = '') {
		super();
	}

	sendAudio(pcm: Uint8Array): void {
		this.sentAudio.push(pcm);
	}

	async finish(): Promise<string> {
		this.finishCount += 1;
		return this.finalText;
	}

	abort(): void {
		this.abortCount += 1;
	}

	simulateFinal(text: string): void {
		this.emit('final', { text });
	}

	simulatePartial(text: string): void {
		this.emit('partial', { text });
	}

	simulateError(error: TranscriptionProviderError): void {
		this.reportError(error);
	}
}
