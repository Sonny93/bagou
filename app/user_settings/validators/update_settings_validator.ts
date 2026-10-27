import vine from '@vinejs/vine';

import userSettingsConfig from '#config/user_settings';
import { DICTATION_LANGUAGES } from '#shared/dictation_language';
import { INTERFACE_LANGUAGES } from '#user_settings/interface_language';

/**
 * Cleanup instructions are nullable because the body parser turns an empty
 * string into `null`.
 */
export const updateSettingsValidator = vine.create({
	dictationLanguage: vine.enum(DICTATION_LANGUAGES),
	interfaceLanguage: vine.enum(INTERFACE_LANGUAGES),
	vocabulary: vine
		.array(
			vine
				.string()
				.trim()
				.minLength(1)
				.maxLength(userSettingsConfig.maxTermLength)
		)
		.maxLength(userSettingsConfig.maxVocabularyTerms),
	cleanupInstructions: vine
		.string()
		.trim()
		.maxLength(userSettingsConfig.maxInstructionsLength)
		.nullable(),
});
