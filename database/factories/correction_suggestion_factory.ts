import Factory from '@adonisjs/lucid/factories';

import CorrectionSuggestion, {
	CORRECTION_SUGGESTION_STATUS,
} from '#correction_suggestions/correction_suggestion';

export const CorrectionSuggestionFactory = Factory.define(
	CorrectionSuggestion,
	({ faker }) => ({
		heard: faker.string.alpha(12),
		written: faker.string.alpha(12),
		status: CORRECTION_SUGGESTION_STATUS.pending,
	})
).build();
