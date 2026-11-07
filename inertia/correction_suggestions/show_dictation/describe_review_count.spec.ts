import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeReviewCount } from '~/correction_suggestions/show_dictation/describe_review_count';
import { activateLocale } from '~/i18n/activate_locale';

describe('describeReviewCount', () => {
	it('should use the singular when one correction waits', () => {
		expect(describeReviewCount(1, i18n)).toBe('1 correction to review');
	});

	it('should use the plural when several corrections wait', () => {
		expect(describeReviewCount(3, i18n)).toBe('3 corrections to review');
	});

	it('should use the French plural when the French locale is active', async () => {
		await activateLocale('fr');

		expect(describeReviewCount(3, i18n)).toBe('3 corrections à valider');
	});
});
