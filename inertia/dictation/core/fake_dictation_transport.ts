import type { DictationStartRequest } from './dictation_start_request';
import type { DictationTranscript } from './dictation_transcript';
import type {
	DictationTransport,
	JoinedDictation,
	TranscriptListener,
} from './dictation_transport';

/**
 * In-memory transport recording every call and letting a spec play the
 * server. By default it answers like a healthy server: once a start or stop
 * is acknowledged it announces `ready` or the completed transcript; the
 * `isReadySilent` and `isCompletionSilent` flags play a server that never
 * does. Like the real socket, `disconnect()` synchronously notifies the
 * connection-lost listener.
 */
export class FakeDictationTransport implements DictationTransport {
	readonly sentAudio: string[] = [];
	readonly calls: string[] = [];
	joinedId: string | undefined;
	startRequest: DictationStartRequest | undefined;
	stopTranscript: DictationTranscript = {
		rawText: 'texte final',
		cleanedDraft: 'Texte final.',
	};
	connectError: Error | undefined;
	startError: Error | undefined;
	stopError: Error | undefined;
	listener: TranscriptListener | undefined;
	#connectionLostListener: () => void = () => undefined;
	#releaseStart: () => void = () => undefined;
	holdStart = false;
	isReadySilent = false;
	isCompletionSilent = false;

	async connect(): Promise<void> {
		this.calls.push('connect');
		if (this.connectError) throw this.connectError;
	}

	disconnect(): void {
		this.calls.push('disconnect');
		this.#connectionLostListener();
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
			start: (request) => this.#start(request),
			sendAudio: (base64Pcm) => this.sentAudio.push(base64Pcm),
			stop: async () => {
				this.calls.push('stop');
				if (this.stopError) throw this.stopError;
				if (!this.isCompletionSilent) {
					this.listener?.onCompleted(this.stopTranscript);
				}
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

	async #start(request: Readonly<DictationStartRequest>): Promise<void> {
		this.calls.push('start');
		this.startRequest = request;
		if (this.startError) throw this.startError;
		if (this.holdStart) {
			await new Promise<void>((resolve) => {
				this.#releaseStart = resolve;
			});
		}
		if (!this.isReadySilent) this.listener?.onReady();
	}
}
