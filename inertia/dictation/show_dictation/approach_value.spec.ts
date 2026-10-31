import { describe, expect, it } from 'vitest';

import { approachValue } from './approach_value';

describe('approachValue', () => {
	it('should move toward the target without reaching it in one short step', () => {
		const next = approachValue(0, 100, 50);

		expect(next).toBeGreaterThan(0);
		expect(next).toBeLessThan(100);
	});

	it('should cover about 63% of the gap after one time constant', () => {
		expect(approachValue(0, 100, 250, 250)).toBeCloseTo(63.2, 1);
	});

	it('should never move backwards', () => {
		expect(approachValue(80, 40, 100)).toBe(80);
	});

	it('should snap to the target when within the snap distance', () => {
		expect(approachValue(99.95, 100, 16)).toBe(100);
	});

	it('should stay put when elapsed time is zero', () => {
		expect(approachValue(10, 100, 0)).toBe(10);
	});
});
