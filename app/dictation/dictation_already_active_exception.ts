import { SocketResponseError } from '@rlanz/socket';

export default class DictationAlreadyActiveException extends SocketResponseError {
	readonly code = 'E_DICTATION_ALREADY_ACTIVE';

	constructor() {
		super('Une dictée est déjà en cours');
	}
}
