import vine from '@vinejs/vine';

import { MAX_DRAFT_TEXT_LENGTH } from '#dictation/validators/start_dictation_validator';

/** The current text of a draft to clean again, for the draft it belongs to. */
export const cleanDraftValidator = vine.create({
	params: vine.object({ draftId: vine.string().uuid() }),
	text: vine.string().trim().minLength(1).maxLength(MAX_DRAFT_TEXT_LENGTH),
});
