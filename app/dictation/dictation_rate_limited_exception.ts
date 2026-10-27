import { SocketResponseError } from '@rlanz/socket';

const CODE = 'E_DICTATION_RATE_LIMITED';

export default class DictationRateLimitedException extends SocketResponseError {
	readonly code = CODE;

	constructor() {
		super(CODE);
	}
}
