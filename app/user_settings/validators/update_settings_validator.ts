import vine from '@vinejs/vine';

import { INTERFACE_LANGUAGES } from '#user_settings/interface_language';
import { cleanupInstructionsField } from '#user_settings/validators/cleanup_instructions_field';
import { dictationLanguageField } from '#user_settings/validators/dictation_language_field';
import { vocabularyField } from '#user_settings/validators/vocabulary_field';

export const updateSettingsValidator = vine.create({
	dictationLanguage: dictationLanguageField(),
	interfaceLanguage: vine.enum(INTERFACE_LANGUAGES),
	vocabulary: vocabularyField(),
	cleanupInstructions: cleanupInstructionsField(),
});
