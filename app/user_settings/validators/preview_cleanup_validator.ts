import vine from '@vinejs/vine';

import { MAX_DRAFT_TEXT_LENGTH } from '#dictation/validators/start_dictation_validator';
import { cleanupInstructionsField } from '#user_settings/validators/cleanup_instructions_field';
import { dictationLanguageField } from '#user_settings/validators/dictation_language_field';
import { vocabularyField } from '#user_settings/validators/vocabulary_field';

/** A sample text to clean with the form values, saved or not. */
export const previewCleanupValidator = vine.create({
	text: vine.string().trim().minLength(1).maxLength(MAX_DRAFT_TEXT_LENGTH),
	dictationLanguage: dictationLanguageField(),
	vocabulary: vocabularyField(),
	cleanupInstructions: cleanupInstructionsField(),
});
