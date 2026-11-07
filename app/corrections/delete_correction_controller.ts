import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { CorrectionService } from '#corrections/correction_service';

const NO_CONTENT_STATUS = 204;

@inject()
export default class DeleteCorrectionController {
	constructor(private readonly correctionService: CorrectionService) {}

	/** JSON only and idempotent: answers 204 even when the pair is already gone. */
	async execute({ auth, params, response }: HttpContext) {
		await this.correctionService.remove(
			auth.getUserOrFail().id,
			Number(params.id)
		);
		return response.status(NO_CONTENT_STATUS).send(null);
	}
}
