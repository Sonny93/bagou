import { SocketResponseError } from '@rlanz/socket';

export default class DictationQuotaExceededException extends SocketResponseError {
	readonly code = 'E_DICTATION_QUOTA_EXCEEDED';

	constructor() {
		super('Quota quotidien de dictée atteint, réessaie demain');
	}
}
