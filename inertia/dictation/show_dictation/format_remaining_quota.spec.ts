import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { formatRemainingQuota } from './format_remaining_quota';
import { activateLocale } from '~/i18n/activate_locale';

describe('formatRemainingQuota', () => {
	it.each([
		[60, '60 min left today'],
		[42, '42 min left today'],
		[1, '1 min left today'],
		[0, 'Daily quota reached'],
		[-3, 'Daily quota reached'],
	])('should format %i remaining minutes as %s', (minutes, expected) => {
		expect(formatRemainingQuota(minutes, i18n)).toBe(expected);
	});

	it('should use the French wording when the French locale is active', async () => {
		await activateLocale('fr');

		expect(formatRemainingQuota(42, i18n)).toBe("Reste 42 min aujourd'hui");
		expect(formatRemainingQuota(0, i18n)).toBe('Quota du jour atteint');
	});
});
