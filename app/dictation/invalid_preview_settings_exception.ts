import { SocketResponseError } from '@rlanz/socket';

const CODE = 'E_INVALID_PREVIEW_SETTINGS';

export default class InvalidPreviewSettingsException extends SocketResponseError {
	readonly code = CODE;

	constructor() {
		super(CODE);
	}
}
