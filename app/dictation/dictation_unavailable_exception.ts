import { SocketResponseError } from '@rlanz/socket';

const CODE = 'E_DICTATION_UNAVAILABLE';

/** Carries the provider error code as message when there is one. */
export default class DictationUnavailableException extends SocketResponseError {
	readonly code = CODE;

	constructor(message: string = CODE) {
		super(message);
	}
}
