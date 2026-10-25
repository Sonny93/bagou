import { inject } from '@adonisjs/core';
import { Logger } from '@adonisjs/core/logger';

import { Dictation } from '#dictation/dictation';
import type { DictationListener } from '#dictation/dictation_listener';
import { TranscriptionProvider } from '#transcription/transcription_provider';

@inject()
export class DictationService {
	constructor(
		private readonly provider: TranscriptionProvider,
		private readonly logger: Logger
	) {}

	create(listener: DictationListener): Dictation {
		return new Dictation(this.provider, this.logger, listener);
	}
}
