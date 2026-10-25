import { PCM_FORMAT } from './pcm_format';

const FULL_SCALE = 0x8000;

/** Root mean square of PCM s16le bytes, normalized to [0, 1]. */
export function pcmLevel(pcm: Uint8Array): number {
	const sampleCount = Math.floor(pcm.length / PCM_FORMAT.bytesPerSample);
	if (sampleCount === 0) return 0;
	const view = new DataView(
		pcm.buffer,
		pcm.byteOffset,
		sampleCount * PCM_FORMAT.bytesPerSample
	);
	let sumOfSquares = 0;
	for (let index = 0; index < sampleCount; index += 1) {
		const sample =
			view.getInt16(index * PCM_FORMAT.bytesPerSample, true) / FULL_SCALE;
		sumOfSquares += sample * sample;
	}
	return Math.sqrt(sumOfSquares / sampleCount);
}
