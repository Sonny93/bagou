import { SocketResponseError } from '@rlanz/socket';

const DEFAULT_MESSAGE = 'La dictée est momentanément indisponible';

export default class DictationUnavailableException extends SocketResponseError {
	readonly code = 'E_DICTATION_UNAVAILABLE';

	constructor(message = DEFAULT_MESSAGE) {
		super(message);
	}
}
