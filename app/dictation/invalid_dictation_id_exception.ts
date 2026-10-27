import { SocketResponseError } from '@rlanz/socket';

const CODE = 'E_INVALID_DICTATION_ID';

export default class InvalidDictationIdException extends SocketResponseError {
	readonly code = CODE;

	constructor() {
		super(CODE);
	}
}
