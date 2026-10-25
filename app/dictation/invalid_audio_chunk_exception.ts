import { SocketResponseError } from '@rlanz/socket';

export default class InvalidAudioChunkException extends SocketResponseError {
	readonly code = 'E_INVALID_AUDIO_CHUNK';

	constructor() {
		super('Le segment audio est invalide ou trop volumineux');
	}
}
