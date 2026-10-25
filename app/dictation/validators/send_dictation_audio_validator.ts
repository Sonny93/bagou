import vine from '@vinejs/vine';

import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';

const BYTES_PER_BASE64_GROUP = 3;
const CHARACTERS_PER_BASE64_GROUP = 4;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

const MAX_BASE64_LENGTH =
	Math.ceil(PCM_AUDIO_FORMAT.bytesPerSecond / BYTES_PER_BASE64_GROUP) *
	CHARACTERS_PER_BASE64_GROUP;

/** One chunk carries at most one second of audio. */
export const sendDictationAudioValidator = vine.create({
	chunk: vine.string().maxLength(MAX_BASE64_LENGTH).regex(BASE64_PATTERN),
});
