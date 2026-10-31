import { describe, expect, it } from 'vitest';

import { getRemainingVisibleMs, MIN_VISIBLE_MS } from './overlay_timing';

const SHOWN_AT = 10_000;

describe('getRemainingVisibleMs', () => {
	it('should require the full minimum duration right after being shown', () => {
		expect(getRemainingVisibleMs(SHOWN_AT, SHOWN_AT)).toBe(MIN_VISIBLE_MS);
	});

	it('should only require what is left of the minimum duration', () => {
		expect(getRemainingVisibleMs(SHOWN_AT, SHOWN_AT + 100)).toBe(
			MIN_VISIBLE_MS - 100
		);
	});

	it('should allow leaving immediately once the minimum duration elapsed', () => {
		expect(getRemainingVisibleMs(SHOWN_AT, SHOWN_AT + MIN_VISIBLE_MS + 1)).toBe(
			0
		);
	});
});
