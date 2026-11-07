import type { I18n, MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

const GENERIC_MESSAGE = msg`Cleanup failed, try again`;

const CLEANUP_ERROR_MESSAGES: Readonly<Record<string, MessageDescriptor>> = {
	E_TEXT_CLEANUP_UNAVAILABLE: msg`Text cleanup is unavailable`,
	E_TEXT_CLEANUP_TIMEOUT: msg`The cleanup took too long, try again or use the standard model`,
};

/** Wording for the stable code the server flashes when a cleanup fails. */
export function describeCleanupError(code: string, i18n: I18n): string {
	return i18n._(CLEANUP_ERROR_MESSAGES[code] ?? GENERIC_MESSAGE);
}
