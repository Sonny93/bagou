import { describe, expect, it } from 'vitest';

import { appendLevel } from './append_level';

describe('appendLevel', () => {
	it('should append the level after the existing ones', () => {
		expect(appendLevel([0.1, 0.2], 0.3, 4)).toEqual([0.1, 0.2, 0.3]);
	});

	it('should drop the oldest levels beyond the capacity', () => {
		expect(appendLevel([0.1, 0.2, 0.3], 0.4, 3)).toEqual([0.2, 0.3, 0.4]);
	});

	it('should not mutate the input levels', () => {
		const levels = Object.freeze([0.1, 0.2]);

		appendLevel(levels, 0.3, 2);

		expect(levels).toEqual([0.1, 0.2]);
	});
});
