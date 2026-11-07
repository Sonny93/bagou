import { BaseTransformer } from '@adonisjs/core/transformers';

import type CorrectionSuggestion from '#correction_suggestions/correction_suggestion';

export default class CorrectionSuggestionTransformer extends BaseTransformer<CorrectionSuggestion> {
	toObject() {
		return {
			id: this.resource.id,
			heard: this.resource.heard,
			written: this.resource.written,
			createdAt: this.resource.createdAt.toJSDate().toISOString(),
		};
	}
}
