import vine from '@vinejs/vine';

import { DICTATION_LANGUAGES } from '#shared/dictation_language';

export const dictationLanguageField = () => vine.enum(DICTATION_LANGUAGES);
