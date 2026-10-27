import { SocketResponseError } from '@rlanz/socket';

const CODE = 'E_DICTATION_ALREADY_ACTIVE';

export default class DictationAlreadyActiveException extends SocketResponseError {
	readonly code = CODE;

	constructor() {
		super(CODE);
	}
}
