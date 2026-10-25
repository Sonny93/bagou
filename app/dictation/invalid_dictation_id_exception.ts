import { SocketResponseError } from '@rlanz/socket';

export default class InvalidDictationIdException extends SocketResponseError {
	readonly code = 'E_INVALID_DICTATION_ID';

	constructor() {
		super("L'identifiant de dictée est invalide");
	}
}
