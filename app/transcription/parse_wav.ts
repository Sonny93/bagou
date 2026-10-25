import { InvalidWavFileError } from '#transcription/invalid_wav_file_error';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';

const RIFF_HEADER_BYTE_LENGTH = 12;
const CHUNK_HEADER_BYTE_LENGTH = 8;
const WAV_PCM_FORMAT_TAG = 1;
const BITS_PER_BYTE = 8;

type WavFormat = {
	formatTag: number;
	channelCount: number;
	sampleRateHz: number;
	bitsPerSample: number;
};

function readTag(view: DataView, offset: number): string {
	const codes = [0, 1, 2, 3].map((index) => view.getUint8(offset + index));
	return String.fromCharCode(...codes);
}

function readFormat(view: DataView, bodyOffset: number): WavFormat {
	return {
		formatTag: view.getUint16(bodyOffset, true),
		channelCount: view.getUint16(bodyOffset + 2, true),
		sampleRateHz: view.getUint32(bodyOffset + 4, true),
		bitsPerSample: view.getUint16(bodyOffset + 14, true),
	};
}

function assertSupportedFormat(format: WavFormat): void {
	const isSupported =
		format.formatTag === WAV_PCM_FORMAT_TAG &&
		format.channelCount === PCM_AUDIO_FORMAT.channelCount &&
		format.sampleRateHz === PCM_AUDIO_FORMAT.sampleRateHz &&
		format.bitsPerSample === PCM_AUDIO_FORMAT.bytesPerSample * BITS_PER_BYTE;
	if (isSupported) return;
	throw new InvalidWavFileError(
		`Unsupported WAV format: expected PCM s16le ${PCM_AUDIO_FORMAT.sampleRateHz} Hz mono, got ${format.sampleRateHz} Hz, ${format.channelCount} channel(s), ${format.bitsPerSample} bits, tag ${format.formatTag}`
	);
}

/**
 * Extracts the raw PCM samples of a WAV file, which must already be PCM
 * s16le, 16 kHz, mono (the only format the transcription port accepts).
 */
export function parseWav(file: Uint8Array): Uint8Array {
	const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
	const isWave =
		file.byteLength >= RIFF_HEADER_BYTE_LENGTH &&
		readTag(view, 0) === 'RIFF' &&
		readTag(view, 8) === 'WAVE';
	if (!isWave) throw new InvalidWavFileError('Not a RIFF/WAVE file');

	let format: WavFormat | undefined;
	let offset = RIFF_HEADER_BYTE_LENGTH;
	while (offset + CHUNK_HEADER_BYTE_LENGTH <= file.byteLength) {
		const tag = readTag(view, offset);
		const size = view.getUint32(offset + 4, true);
		const bodyOffset = offset + CHUNK_HEADER_BYTE_LENGTH;
		if (tag === 'fmt ') format = readFormat(view, bodyOffset);
		if (tag === 'data') return extractSamples(file, format, bodyOffset, size);
		offset = bodyOffset + size + (size % 2);
	}
	throw new InvalidWavFileError('WAV file has no data chunk');
}

function extractSamples(
	file: Uint8Array,
	format: WavFormat | undefined,
	bodyOffset: number,
	declaredSize: number
): Uint8Array {
	if (!format)
		throw new InvalidWavFileError('WAV data chunk precedes fmt chunk');
	assertSupportedFormat(format);
	const availableSize = Math.min(declaredSize, file.byteLength - bodyOffset);
	const wholeSamplesSize =
		availableSize - (availableSize % PCM_AUDIO_FORMAT.bytesPerSample);
	return file.subarray(bodyOffset, bodyOffset + wholeSamplesSize);
}
