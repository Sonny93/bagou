import { describe, expect, it } from 'vitest';

import { formatElapsedTime } from './format_elapsed_time';

describe('formatElapsedTime', () => {
	it.each([
		[0, '0:00'],
		[999, '0:00'],
		[9_000, '0:09'],
		[65_000, '1:05'],
		[600_000, '10:00'],
	])('should format %i ms as %s', (milliseconds, expected) => {
		expect(formatElapsedTime(milliseconds)).toBe(expected);
	});
});
