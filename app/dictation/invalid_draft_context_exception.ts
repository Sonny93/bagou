import { SocketResponseError } from '@rlanz/socket';

const CODE = 'E_INVALID_DRAFT_CONTEXT';

export default class InvalidDraftContextException extends SocketResponseError {
	readonly code = CODE;

	constructor() {
		super(CODE);
	}
}
