import type {
	DictationTransport,
	JoinedDictation,
	TranscriptListener,
} from './dictation_transport';

/** In-memory transport recording every call and letting a spec play the server. */
export class FakeDictationTransport implements DictationTransport {
	readonly sentAudio: string[] = [];
	readonly calls: string[] = [];
	joinedId: string | undefined;
	stopText = 'texte final';
	connectError: Error | undefined;
	startError: Error | undefined;
	stopError: Error | undefined;
	listener: TranscriptListener | undefined;
	#connectionLostListener: () => void = () => undefined;
	#releaseStart: () => void = () => undefined;
	holdStart = false;

	async connect(): Promise<void> {
		this.calls.push('connect');
		if (this.connectError) throw this.connectError;
	}

	disconnect(): void {
		this.calls.push('disconnect');
	}

	onConnectionLost(listener: () => void): void {
		this.#connectionLostListener = listener;
	}

	async join(
		dictationId: string,
		listener: TranscriptListener
	): Promise<JoinedDictation> {
		this.joinedId = dictationId;
		this.listener = listener;
		return {
			start: () => this.#start(),
			sendAudio: (base64Pcm) => this.sentAudio.push(base64Pcm),
			stop: async () => {
				this.calls.push('stop');
				if (this.stopError) throw this.stopError;
				return this.stopText;
			},
			cancel: () => this.calls.push('cancel'),
		};
	}

	releaseStart(): void {
		this.#releaseStart();
	}

	simulateConnectionLost(): void {
		this.#connectionLostListener();
	}

	async #start(): Promise<void> {
		this.calls.push('start');
		if (this.startError) throw this.startError;
		if (!this.holdStart) return;
		await new Promise<void>((resolve) => {
			this.#releaseStart = resolve;
		});
	}
}
