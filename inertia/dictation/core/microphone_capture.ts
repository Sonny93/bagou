import { MicrophoneError } from './microphone_error';
import { PCM_CAPTURE_PROCESSOR_NAME } from './pcm_capture_processor_name';
import { PCM_FORMAT } from './pcm_format';
import type {
	PcmWorkletCommand,
	PcmWorkletMessage,
} from './pcm_worklet_message';
import { toMicrophoneError } from './to_microphone_error';

const FLUSH_TIMEOUT_MS = 300;
const RESUME_TIMEOUT_MS = 1000;

export type FrameHandler = (frame: Uint8Array, level: number) => void;

type CaptureGraph = {
	context: AudioContext;
	stream: MediaStream;
	worklet: AudioWorkletNode;
};

/**
 * Captures the microphone as 100 ms PCM s16le 16 kHz mono frames. The
 * AudioContext runs at 16 kHz so Chromium resamples the microphone natively.
 */
export class MicrophoneCapture {
	#graph: CaptureGraph | undefined;
	#onFlushed: (() => void) | undefined;

	constructor(
		private readonly workletUrl: string,
		private readonly onFrame: FrameHandler
	) {}

	async start(): Promise<void> {
		if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorklet) {
			throw new MicrophoneError('unsupported');
		}
		try {
			this.#graph = await this.#openGraph();
		} catch (error) {
			throw toMicrophoneError(error);
		}
	}

	/** Sends the last partial frame, then releases the microphone. */
	async stop(): Promise<void> {
		const graph = this.#graph;
		this.#graph = undefined;
		if (!graph) return;
		await this.#flush(graph.worklet);
		graph.worklet.disconnect();
		graph.stream.getTracks().forEach((track) => track.stop());
		await graph.context.close();
	}

	async #openGraph(): Promise<CaptureGraph> {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: { channelCount: 1, noiseSuppression: true, autoGainControl: true },
		});
		const context = new AudioContext({ sampleRate: PCM_FORMAT.sampleRateHz });
		try {
			await context.audioWorklet.addModule(this.workletUrl);
			const worklet = new AudioWorkletNode(context, PCM_CAPTURE_PROCESSOR_NAME);
			worklet.port.onmessage = this.#handleMessage;
			context.createMediaStreamSource(stream).connect(worklet);
			await this.#ensureRunning(context);
			return { context, stream, worklet };
		} catch (error) {
			stream.getTracks().forEach((track) => track.stop());
			await context.close();
			throw error;
		}
	}

	/**
	 * A context created without user activation starts suspended; Chromium
	 * lets it run when microphone capture is granted, otherwise the page needs
	 * a click or key press first.
	 */
	async #ensureRunning(context: AudioContext): Promise<void> {
		const timeout = new Promise((resolve) =>
			setTimeout(resolve, RESUME_TIMEOUT_MS)
		);
		await Promise.race([context.resume(), timeout]);
		if (context.state !== 'running') throw new MicrophoneError('audio_blocked');
	}

	#handleMessage = (event: MessageEvent<PcmWorkletMessage>): void => {
		if (event.data.type === 'flushed') this.#onFlushed?.();
		else this.onFrame(new Uint8Array(event.data.frame), event.data.level);
	};

	#flush(worklet: AudioWorkletNode): Promise<void> {
		return new Promise((resolve) => {
			const timer = setTimeout(resolve, FLUSH_TIMEOUT_MS);
			this.#onFlushed = () => {
				clearTimeout(timer);
				resolve();
			};
			const command: PcmWorkletCommand = { type: 'flush' };
			worklet.port.postMessage(command);
		});
	}
}
