import { errors } from '@vinejs/vine';

import type { DraftContext } from '#dictation/draft_context';
import InvalidDraftContextException from '#dictation/invalid_draft_context_exception';
import { startDictationValidator } from '#dictation/validators/start_dictation_validator';

/** Validates one untrusted `dictation:start` payload. */
export async function parseDraftContext(
	payload: unknown
): Promise<DraftContext> {
	try {
		return await startDictationValidator.validate(payload);
	} catch (error) {
		if (error instanceof errors.E_VALIDATION_ERROR) {
			throw new InvalidDraftContextException();
		}
		throw error;
	}
}
