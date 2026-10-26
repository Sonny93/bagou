import { Exception } from '@adonisjs/core/exceptions';

export default class TranscriptNotFoundException extends Exception {
	static status = 404;
	static code = 'E_TRANSCRIPT_NOT_FOUND';

	constructor() {
		super('Dictée introuvable');
	}
}
