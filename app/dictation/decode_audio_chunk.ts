import { errors } from '@vinejs/vine';

import InvalidAudioChunkException from '#dictation/invalid_audio_chunk_exception';
import { sendDictationAudioValidator } from '#dictation/validators/send_dictation_audio_validator';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';

/**
 * Validates one untrusted `dictation:audio` payload and decodes its base64 PCM.
 * A whole number of 16-bit samples is required, so a truncated chunk fails
 * here instead of corrupting the stream.
 */
export async function decodeAudioChunk(payload: unknown): Promise<Uint8Array> {
	const { chunk } = await validate(payload);
	const pcm = Buffer.from(chunk, 'base64');
	if (pcm.byteLength % PCM_AUDIO_FORMAT.bytesPerSample !== 0) {
		throw new InvalidAudioChunkException();
	}
	return pcm;
}

async function validate(payload: unknown): Promise<{ chunk: string }> {
	try {
		return await sendDictationAudioValidator.validate(payload);
	} catch (error) {
		if (error instanceof errors.E_VALIDATION_ERROR) {
			throw new InvalidAudioChunkException();
		}
		throw error;
	}
}
