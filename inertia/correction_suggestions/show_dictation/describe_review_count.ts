import type { I18n } from '@lingui/core';
import { msg, plural } from '@lingui/core/macro';

export function describeReviewCount(count: number, i18n: I18n): string {
	return i18n._(
		msg`${plural(count, {
			one: '# correction to review',
			other: '# corrections to review',
		})}`
	);
}
