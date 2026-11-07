import type { I18n, MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import type { CorrectionFailure } from '~/corrections/shared/read_correction_failure';

const NETWORK_MESSAGE = msg`The server is unreachable`;
const GENERIC_MESSAGE = msg`The correction could not be saved, try again`;
const INVALID_MESSAGE = msg`This correction is not valid`;

const CORRECTION_CODE_MESSAGES: Readonly<Record<string, MessageDescriptor>> = {
	E_CORRECTIONS_FULL: msg`Corrections limit reached. Remove some in the settings.`,
	E_CORRECTIONS_STORAGE: msg`The correction could not be saved, try again`,
	E_TOO_MANY_REQUESTS: msg`Too many requests, wait a minute`,
};

/** Wording for a failed corrections request, as a whole rather than per field. */
export function describeCorrectionFailure(
	failure: CorrectionFailure,
	i18n: I18n
): string {
	switch (failure.kind) {
		case 'network':
			return i18n._(NETWORK_MESSAGE);
		case 'fields':
			return i18n._(INVALID_MESSAGE);
		case 'code':
			return i18n._(CORRECTION_CODE_MESSAGES[failure.code] ?? GENERIC_MESSAGE);
		case 'unknown':
			return i18n._(GENERIC_MESSAGE);
	}
}
