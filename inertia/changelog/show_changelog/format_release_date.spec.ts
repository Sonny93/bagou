import { describe, expect, it } from 'vitest';

import { formatReleaseDate } from '~/changelog/show_changelog/format_release_date';

describe('formatReleaseDate', () => {
	it('should format the date in English', () => {
		expect(formatReleaseDate('2026-10-28', 'en')).toBe('October 28, 2026');
	});

	it('should format the date in French', () => {
		expect(formatReleaseDate('2026-10-28', 'fr')).toBe('28 octobre 2026');
	});
});
