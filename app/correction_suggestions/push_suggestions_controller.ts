import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { CorrectionSuggestionService } from '#correction_suggestions/correction_suggestion_service';
import CorrectionSuggestionTransformer from '#correction_suggestions/correction_suggestion_transformer';
import { pushSuggestionsValidator } from '#correction_suggestions/validators/push_suggestions_validator';

@inject()
export default class PushSuggestionsController {
	constructor(
		private readonly correctionSuggestionService: CorrectionSuggestionService
	) {}

	/**
	 * JSON only: stores the detected pairs and returns the pending suggestions.
	 * The app has no HTTP serializer, so the transformer shapes each object
	 * directly.
	 */
	async execute({ auth, request }: HttpContext) {
		const { draftId, pairs } = await request.validateUsing(
			pushSuggestionsValidator
		);
		const pending = await this.correctionSuggestionService.push(
			auth.getUserOrFail().id,
			draftId,
			pairs
		);
		return {
			pending: pending.map((suggestion) =>
				new CorrectionSuggestionTransformer(suggestion).toObject()
			),
		};
	}
}
