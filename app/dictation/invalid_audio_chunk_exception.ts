import { SocketResponseError } from '@rlanz/socket';

const CODE = 'E_INVALID_AUDIO_CHUNK';

export default class InvalidAudioChunkException extends SocketResponseError {
	readonly code = CODE;

	constructor() {
		super(CODE);
	}
}
