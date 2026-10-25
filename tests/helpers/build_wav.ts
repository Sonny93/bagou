type WavOptions = {
	sampleRateHz?: number;
	channelCount?: number;
	bitsPerSample?: number;
	samples?: Uint8Array;
	extraChunkBeforeData?: boolean;
	declaredDataSize?: number;
};

const FMT_BODY_BYTE_LENGTH = 16;
const PCM_FORMAT_TAG = 1;
const DEFAULT_SAMPLE_RATE_HZ = 16_000;
const BITS_PER_BYTE = 8;

function chunk(tag: string, body: Uint8Array): Uint8Array {
	const padding = body.byteLength % 2;
	const bytes = new Uint8Array(8 + body.byteLength + padding);
	const view = new DataView(bytes.buffer);
	bytes.set(new TextEncoder().encode(tag), 0);
	view.setUint32(4, body.byteLength, true);
	bytes.set(body, 8);
	return bytes;
}

function formatBody(options: Required<WavOptions>): Uint8Array {
	const body = new Uint8Array(FMT_BODY_BYTE_LENGTH);
	const view = new DataView(body.buffer);
	const blockAlign =
		(options.channelCount * options.bitsPerSample) / BITS_PER_BYTE;
	view.setUint16(0, PCM_FORMAT_TAG, true);
	view.setUint16(2, options.channelCount, true);
	view.setUint32(4, options.sampleRateHz, true);
	view.setUint32(8, options.sampleRateHz * blockAlign, true);
	view.setUint16(12, blockAlign, true);
	view.setUint16(14, options.bitsPerSample, true);
	return body;
}

/** Builds a minimal WAV file; defaults describe the accepted format. */
export function buildWav(overrides: Readonly<WavOptions> = {}): Uint8Array {
	const samples = overrides.samples ?? new Uint8Array([1, 0, 2, 0, 3, 0]);
	const options = {
		sampleRateHz: DEFAULT_SAMPLE_RATE_HZ,
		channelCount: 1,
		bitsPerSample: 16,
		samples,
		extraChunkBeforeData: false,
		declaredDataSize: samples.byteLength,
		...overrides,
	};
	const dataChunk = chunk('data', options.samples);
	new DataView(dataChunk.buffer).setUint32(4, options.declaredDataSize, true);
	const chunks = [
		chunk('fmt ', formatBody(options)),
		...(options.extraChunkBeforeData ? [chunk('LIST', new Uint8Array(5))] : []),
		dataChunk,
	];
	const body = new Uint8Array(
		4 + chunks.reduce((sum, part) => sum + part.byteLength, 0)
	);
	body.set(new TextEncoder().encode('WAVE'), 0);
	let offset = 4;
	for (const part of chunks) {
		body.set(part, offset);
		offset += part.byteLength;
	}
	return concatenate(chunk('RIFF', body).subarray(0, 8), body);
}

function concatenate(head: Uint8Array, tail: Uint8Array): Uint8Array {
	const bytes = new Uint8Array(head.byteLength + tail.byteLength);
	bytes.set(head, 0);
	bytes.set(tail, head.byteLength);
	return bytes;
}
