import { BaseTransformer } from '@adonisjs/core/transformers';

import type Transcript from '#transcription_history/transcript';

export default class TranscriptTransformer extends BaseTransformer<Transcript> {
	toObject() {
		return {
			id: this.resource.id,
			rawText: this.resource.rawText,
			cleanedText: this.resource.cleanedText,
			createdAt: this.resource.createdAt.toJSDate().toISOString(),
		};
	}
}
