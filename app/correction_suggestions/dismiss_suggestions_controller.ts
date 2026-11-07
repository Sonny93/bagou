import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { CorrectionSuggestionService } from '#correction_suggestions/correction_suggestion_service';
import { dismissSuggestionsValidator } from '#correction_suggestions/validators/dismiss_suggestions_validator';

@inject()
export default class DismissSuggestionsController {
	constructor(
		private readonly correctionSuggestionService: CorrectionSuggestionService
	) {}

	/** JSON only: the pairs are never suggested again. */
	async execute({ auth, request, response }: HttpContext) {
		const { pairs } = await request.validateUsing(dismissSuggestionsValidator);
		await this.correctionSuggestionService.dismiss(
			auth.getUserOrFail().id,
			pairs
		);
		return response.noContent();
	}
}
