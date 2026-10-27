import vine from '@vinejs/vine';

import { cleanupInstructionsField } from '#user_settings/validators/cleanup_instructions_field';
import { dictationLanguageField } from '#user_settings/validators/dictation_language_field';
import { vocabularyField } from '#user_settings/validators/vocabulary_field';

/** The form values a preview tries, saved or not. */
export const previewSettingsValidator = vine.create({
	dictationLanguage: dictationLanguageField(),
	vocabulary: vocabularyField(),
	cleanupInstructions: cleanupInstructionsField(),
});
