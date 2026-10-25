import { test } from '@japa/runner';

import { decodeAudioChunk } from '#dictation/decode_audio_chunk';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';

const toBase64 = (bytes: Uint8Array): string =>
	Buffer.from(bytes).toString('base64');

test.group('decodeAudioChunk', () => {
	test('should decode a base64 chunk into its PCM bytes', async ({
		assert,
	}) => {
		const pcm = await decodeAudioChunk({
			chunk: toBase64(new Uint8Array([1, 0, 2, 0])),
		});

		assert.deepEqual([...pcm], [1, 0, 2, 0]);
	});

	test('should accept a chunk of exactly one second of audio', async ({
		assert,
	}) => {
		const oneSecond = new Uint8Array(PCM_AUDIO_FORMAT.bytesPerSecond);

		const pcm = await decodeAudioChunk({ chunk: toBase64(oneSecond) });

		assert.equal(pcm.byteLength, PCM_AUDIO_FORMAT.bytesPerSecond);
	});

	test('should reject a chunk longer than one second of audio', async ({
		assert,
	}) => {
		const tooLong = new Uint8Array(PCM_AUDIO_FORMAT.bytesPerSecond + 2);

		await assert.rejects(
			() => decodeAudioChunk({ chunk: toBase64(tooLong) }),
			/invalide ou trop volumineux/
		);
	});

	test('should reject a payload without a string chunk', async ({ assert }) => {
		await assert.rejects(() => decodeAudioChunk({}), /invalide/);
		await assert.rejects(() => decodeAudioChunk({ chunk: 12 }), /invalide/);
		await assert.rejects(() => decodeAudioChunk(undefined), /invalide/);
	});

	test('should reject a chunk that is not base64', async ({ assert }) => {
		await assert.rejects(
			() => decodeAudioChunk({ chunk: 'not base64 !' }),
			/invalide/
		);
	});

	test('should reject a chunk that cuts a 16-bit sample in half', async ({
		assert,
	}) => {
		await assert.rejects(
			() => decodeAudioChunk({ chunk: toBase64(new Uint8Array([1, 2, 3])) }),
			/invalide/
		);
	});
});
