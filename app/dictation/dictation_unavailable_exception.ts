import { SocketResponseError } from '@rlanz/socket';

export default class DictationUnavailableException extends SocketResponseError {
	readonly code = 'E_DICTATION_UNAVAILABLE';

	constructor() {
		super('La dictée est momentanément indisponible');
	}
}
