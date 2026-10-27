import type { I18n } from '@lingui/core';
import { msg, plural } from '@lingui/core/macro';

export function describeDeletionCount(count: number, i18n: I18n): string {
	return i18n._(
		msg`${plural(count, {
			one: '# dictation will be permanently deleted.',
			other: '# dictations will be permanently deleted.',
		})}`
	);
}
