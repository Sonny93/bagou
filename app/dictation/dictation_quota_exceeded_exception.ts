import { SocketResponseError } from '@rlanz/socket';

const CODE = 'E_DICTATION_QUOTA_EXCEEDED';

export default class DictationQuotaExceededException extends SocketResponseError {
	readonly code = CODE;

	constructor() {
		super(CODE);
	}
}
