import vine from '@vinejs/vine';

import { cleanupQualityField } from '#user_settings/validators/cleanup_quality_field';

/** The entry to clean again from its raw text, with the quality to compare. */
export const recleanTranscriptValidator = vine.create({
	params: vine.object({ id: vine.number() }),
	cleanupQuality: cleanupQualityField(),
});
