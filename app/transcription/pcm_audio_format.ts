const SAMPLE_RATE_HZ = 16_000;
const BYTES_PER_SAMPLE = 2;
const CHANNEL_COUNT = 1;
const CHUNK_DURATION_MS = 100;
const MILLISECONDS_PER_SECOND = 1000;

const BYTES_PER_SECOND = SAMPLE_RATE_HZ * BYTES_PER_SAMPLE * CHANNEL_COUNT;

/**
 * The only audio format that crosses the transcription port: PCM signed 16-bit
 * little-endian, 16 kHz, mono, normalized once in the browser.
 */
export const PCM_AUDIO_FORMAT = {
	sampleRateHz: SAMPLE_RATE_HZ,
	bytesPerSample: BYTES_PER_SAMPLE,
	channelCount: CHANNEL_COUNT,
	bytesPerSecond: BYTES_PER_SECOND,
	chunkDurationMs: CHUNK_DURATION_MS,
	chunkByteLength:
		(BYTES_PER_SECOND * CHUNK_DURATION_MS) / MILLISECONDS_PER_SECOND,
} as const;
