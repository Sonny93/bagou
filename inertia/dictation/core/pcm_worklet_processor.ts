import { floatToPcm16 } from './float_to_pcm16';
import { PCM_CAPTURE_PROCESSOR_NAME } from './pcm_capture_processor_name';
import { PCM_FORMAT } from './pcm_format';
import { PcmFrameAccumulator } from './pcm_frame_accumulator';
import { pcmLevel } from './pcm_level';
import type {
	PcmWorkletCommand,
	PcmWorkletMessage,
} from './pcm_worklet_message';

/**
 * Runs on the audio thread. The AudioContext is created at 16 kHz, so the
 * browser has already resampled the microphone: this only converts to PCM
 * s16le and posts 100 ms frames (plus an RMS level) as transferables.
 */
class PcmCaptureProcessor extends AudioWorkletProcessor {
	readonly #accumulator = new PcmFrameAccumulator(PCM_FORMAT.frameByteLength);

	constructor() {
		super();
		this.port.onmessage = (event: MessageEvent<PcmWorkletCommand>) => {
			if (event.data.type === 'flush') this.#flush();
		};
	}

	override process(inputs: Float32Array[][]): boolean {
		const channel = inputs[0]?.[0];
		if (!channel) return true;
		for (const frame of this.#accumulator.push(floatToPcm16(channel))) {
			this.#postFrame(frame);
		}
		return true;
	}

	#flush(): void {
		const remainder = this.#accumulator.flush();
		if (remainder) this.#postFrame(remainder);
		this.#post({ type: 'flushed' });
	}

	#postFrame(frame: Uint8Array<ArrayBuffer>): void {
		this.#post({ type: 'frame', frame: frame.buffer, level: pcmLevel(frame) }, [
			frame.buffer,
		]);
	}

	#post(message: PcmWorkletMessage, transfer: Transferable[] = []): void {
		this.port.postMessage(message, transfer);
	}
}

registerProcessor(PCM_CAPTURE_PROCESSOR_NAME, PcmCaptureProcessor);
