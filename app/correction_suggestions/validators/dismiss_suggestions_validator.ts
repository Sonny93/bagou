import vine from '@vinejs/vine';

import correctionSuggestionsConfig from '#config/correction_suggestions';
import { correctionSideField } from '#corrections/validators/correction_side_field';

export const dismissSuggestionsValidator = vine.create({
	pairs: vine
		.array(
			vine.object({
				heard: correctionSideField(),
				written: correctionSideField().notSameAs('heard'),
			})
		)
		.minLength(1)
		.maxLength(correctionSuggestionsConfig.maxDismissalsPerRequest),
});
