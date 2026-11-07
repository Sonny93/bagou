import type { I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import type { CorrectionPair } from '~/dictation/core/correction_pair';

/** What a screen reader hears when a suggestion shows, or when the number of suggestions behind the first one changes. */
export function describeSuggestionAnnouncement(
	{ heard, written }: Readonly<CorrectionPair>,
	total: number,
	i18n: I18n
): string {
	if (total <= 1) {
		return i18n._(msg`Correction suggested: remember ${written} for ${heard}?`);
	}
	const position = 1;
	return i18n._(
		msg`Correction suggested (${position} of ${total}): remember ${written} for ${heard}?`
	);
}
