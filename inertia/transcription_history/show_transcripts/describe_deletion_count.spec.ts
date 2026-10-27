import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { describeDeletionCount } from './describe_deletion_count';
import { activateLocale } from '~/i18n/activate_locale';

describe('describeDeletionCount', () => {
	it('should use the singular when one dictation is deleted', () => {
		expect(describeDeletionCount(1, i18n)).toBe(
			'1 dictation will be permanently deleted.'
		);
	});

	it('should use the plural when several dictations are deleted', () => {
		expect(describeDeletionCount(12, i18n)).toBe(
			'12 dictations will be permanently deleted.'
		);
	});

	it('should use the French plural when the French locale is active', async () => {
		await activateLocale('fr');

		expect(describeDeletionCount(12, i18n)).toBe(
			'12 dictées seront supprimées définitivement.'
		);
	});
});
