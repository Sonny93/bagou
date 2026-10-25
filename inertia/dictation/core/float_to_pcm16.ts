import { PCM_FORMAT } from './pcm_format';

const NEGATIVE_FULL_SCALE = 0x8000;
const POSITIVE_FULL_SCALE = 0x7fff;

/**
 * Converts float samples in [-1, 1] to PCM s16le bytes. Out-of-range values
 * are clamped, and the byte order is explicit instead of depending on the
 * platform.
 */
export function floatToPcm16(samples: Float32Array): Uint8Array {
	const bytes = new Uint8Array(samples.length * PCM_FORMAT.bytesPerSample);
	const view = new DataView(bytes.buffer);
	samples.forEach((sample, index) => {
		const clamped = Math.max(-1, Math.min(1, sample));
		const scale = clamped < 0 ? NEGATIVE_FULL_SCALE : POSITIVE_FULL_SCALE;
		view.setInt16(
			index * PCM_FORMAT.bytesPerSample,
			Math.round(clamped * scale),
			true
		);
	});
	return bytes;
}
