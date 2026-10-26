import { describe, expect, it } from 'vitest';

import { formatRemainingQuota } from './format_remaining_quota';

describe('formatRemainingQuota', () => {
	it.each([
		[60, "Reste 60 min aujourd'hui"],
		[42, "Reste 42 min aujourd'hui"],
		[1, "Reste 1 min aujourd'hui"],
		[0, 'Quota du jour atteint'],
		[-3, 'Quota du jour atteint'],
	])('should format %i remaining minutes as %s', (minutes, expected) => {
		expect(formatRemainingQuota(minutes)).toBe(expected);
	});
});
