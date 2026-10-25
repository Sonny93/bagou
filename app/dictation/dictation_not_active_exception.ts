import { SocketResponseError } from '@rlanz/socket';

export default class DictationNotActiveException extends SocketResponseError {
	readonly code = 'E_DICTATION_NOT_ACTIVE';

	constructor() {
		super("Aucune dictée n'est en cours");
	}
}
