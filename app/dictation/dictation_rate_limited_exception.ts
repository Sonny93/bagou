import { SocketResponseError } from '@rlanz/socket';

export default class DictationRateLimitedException extends SocketResponseError {
	readonly code = 'E_DICTATION_RATE_LIMITED';

	constructor() {
		super('Trop de dictées lancées, patiente une minute');
	}
}
