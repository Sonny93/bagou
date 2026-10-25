import { DictationClient } from './dictation_client';
import type { DictationClientError } from './dictation_client_error';
import type { DictationTransport } from './dictation_transport';
import { MicrophoneCapture } from './microphone_capture';

export type DictationSessionListener = {
	onPartial(text: string): void;
	onFinal(text: string): void;
	onLevel(level: number): void;
	onError(error: DictationClientError): void;
};

export type DictationSessionDependencies = {
	workletUrl: string;
	createTransport: () => DictationTransport;
};

/**
 * Microphone and server session of one dictation, started together so the
 * first words are not lost while the server session opens, and torn down
 * together whatever the outcome.
 */
export class DictationSession {
	readonly #capture: MicrophoneCapture;
	readonly #client: DictationClient;
	#isCancelled = false;

	constructor(
		dependencies: Readonly<DictationSessionDependencies>,
		listener: DictationSessionListener
	) {
		this.#client = new DictationClient(
			dependencies.createTransport(),
			listener
		);
		this.#capture = new MicrophoneCapture(
			dependencies.workletUrl,
			(frame, level) => {
				this.#client.sendAudio(frame);
				listener.onLevel(level);
			}
		);
	}

	/** Rejects with a `MicrophoneError` or a `DictationClientError`. */
	async start(): Promise<void> {
		const results = await Promise.allSettled([
			this.#capture.start(),
			this.#client.start(),
		]);
		const failure = results.find((result) => result.status === 'rejected');
		if (!failure && !this.#isCancelled) return;
		await this.#release();
		if (failure) throw failure.reason;
	}

	/** Sends the last audio, then resolves the final text. */
	async stop(): Promise<string> {
		await this.#capture.stop();
		return this.#client.stop();
	}

	async cancel(): Promise<void> {
		this.#isCancelled = true;
		await this.#release();
	}

	async #release(): Promise<void> {
		this.#client.cancel();
		await this.#capture.stop();
	}
}
