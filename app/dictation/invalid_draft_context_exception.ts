import { SocketResponseError } from '@rlanz/socket';

export default class InvalidDraftContextException extends SocketResponseError {
	readonly code = 'E_INVALID_DRAFT_CONTEXT';

	constructor() {
		super('Le brouillon est invalide ou trop volumineux');
	}
}
