const SAMPLE_RATE_HZ = 16_000;
const BYTES_PER_SAMPLE = 2;
const FRAME_DURATION_MS = 100;
const MILLISECONDS_PER_SECOND = 1000;

/**
 * Audio format of the whole dictation pipeline: PCM signed 16-bit
 * little-endian, 16 kHz, mono, cut into 100 ms frames (3200 bytes). Mirrors
 * `PCM_AUDIO_FORMAT` on the server.
 */
export const PCM_FORMAT = {
	sampleRateHz: SAMPLE_RATE_HZ,
	bytesPerSample: BYTES_PER_SAMPLE,
	frameByteLength:
		(SAMPLE_RATE_HZ * BYTES_PER_SAMPLE * FRAME_DURATION_MS) /
		MILLISECONDS_PER_SECOND,
} as const;
