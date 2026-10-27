import { SocketResponseError } from '@rlanz/socket';

const CODE = 'E_DICTATION_NOT_ACTIVE';

export default class DictationNotActiveException extends SocketResponseError {
	readonly code = CODE;

	constructor() {
		super(CODE);
	}
}
