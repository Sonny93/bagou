import type { I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

/** Wording of the minutes of dictation left today. */
export function formatRemainingQuota(
	remainingMinutes: number,
	i18n: I18n
): string {
	if (remainingMinutes <= 0) return i18n._(msg`Daily quota reached`);
	return i18n._(msg`${remainingMinutes} min left today`);
}
