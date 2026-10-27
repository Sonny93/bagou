import vine from '@vinejs/vine';

import userSettingsConfig from '#config/user_settings';

export const vocabularyField = () =>
	vine
		.array(
			vine
				.string()
				.trim()
				.minLength(1)
				.maxLength(userSettingsConfig.maxTermLength)
		)
		.maxLength(userSettingsConfig.maxVocabularyTerms);
