import { test } from '@japa/runner';

import { buildWav } from '#tests/helpers/build_wav';
import { InvalidWavFileError } from '#transcription/invalid_wav_file_error';
import { parseWav } from '#transcription/parse_wav';

test.group('parseWav', () => {
	test('should return the raw samples of a PCM s16le 16 kHz mono file', ({
		assert,
	}) => {
		const samples = new Uint8Array([1, 0, 2, 0, 3, 0]);

		const pcm = parseWav(buildWav({ samples }));

		assert.deepEqual([...pcm], [...samples]);
	});

	test('should skip chunks it does not know before the data chunk', ({
		assert,
	}) => {
		const samples = new Uint8Array([9, 0, 8, 0]);

		const pcm = parseWav(buildWav({ samples, extraChunkBeforeData: true }));

		assert.deepEqual([...pcm], [...samples]);
	});

	test('should stop at the end of the file when the data size is larger than the file', ({
		assert,
	}) => {
		const samples = new Uint8Array([1, 0, 2, 0]);

		const pcm = parseWav(buildWav({ samples, declaredDataSize: 0xffffffff }));

		assert.deepEqual([...pcm], [...samples]);
	});

	test('should drop a trailing byte that does not complete a sample', ({
		assert,
	}) => {
		const samples = new Uint8Array([1, 0, 2, 0, 3]);

		const pcm = parseWav(buildWav({ samples }));

		assert.equal(pcm.byteLength, 4);
	});

	test('should reject a file that is not a WAV', ({ assert }) => {
		const notWav = new TextEncoder().encode('definitely not audio');

		assert.throws(() => parseWav(notWav), InvalidWavFileError);
	});

	test('should reject a WAV without a data chunk', ({ assert }) => {
		const truncated = buildWav().subarray(0, 12 + 8 + 16);

		assert.throws(() => parseWav(truncated), /no data chunk/);
	});

	test('should reject a sample rate other than 16 kHz', ({ assert }) => {
		const file = buildWav({ sampleRateHz: 44_100 });

		assert.throws(() => parseWav(file), /44100 Hz/);
	});

	test('should reject stereo audio', ({ assert }) => {
		const file = buildWav({ channelCount: 2 });

		assert.throws(() => parseWav(file), /2 channel/);
	});

	test('should reject a sample size other than 16 bits', ({ assert }) => {
		const file = buildWav({ bitsPerSample: 8 });

		assert.throws(() => parseWav(file), /8 bits/);
	});
});
