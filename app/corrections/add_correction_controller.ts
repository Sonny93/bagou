import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { CorrectionService } from '#corrections/correction_service';
import CorrectionTransformer from '#corrections/correction_transformer';
import { addCorrectionValidator } from '#corrections/validators/add_correction_validator';

@inject()
export default class AddCorrectionController {
	constructor(private readonly correctionService: CorrectionService) {}

	/**
	 * JSON only: remembers a pair and returns it, without touching the settings
	 * form. The app has no HTTP serializer, so the transformer shapes the object
	 * directly.
	 */
	async execute({ auth, request }: HttpContext) {
		const pair = await request.validateUsing(addCorrectionValidator);
		const correction = await this.correctionService.add(
			auth.getUserOrFail().id,
			pair
		);
		return new CorrectionTransformer(correction).toObject();
	}
}
