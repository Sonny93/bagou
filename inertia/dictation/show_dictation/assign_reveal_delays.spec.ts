import { describe, expect, it } from 'vitest';

import { assignRevealDelays } from '~/dictation/show_dictation/assign_reveal_delays';

const NO_DELAYS: ReadonlyMap<string, number> = new Map();

describe('assignRevealDelays', () => {
	it('should stagger the words of a first batch in reading order', () => {
		const delays = assignRevealDelays(NO_DELAYS, ['0:a', '1:b', '2:c']);

		expect([...delays.values()]).toEqual([0, 60, 120]);
	});

	it('should cap the delay of long batches', () => {
		const keys = ['0:a', '1:b', '2:c', '3:d', '4:e', '5:f', '6:g'];

		const delays = assignRevealDelays(NO_DELAYS, keys);

		expect([...delays.values()].slice(4)).toEqual([240, 240, 240]);
	});

	it('should keep the delay of existing words when new words are appended', () => {
		const previous = assignRevealDelays(NO_DELAYS, ['0:a', '1:b']);

		const delays = assignRevealDelays(previous, ['0:a', '1:b', '2:c', '3:d']);

		expect([...delays.values()]).toEqual([0, 60, 0, 60]);
	});

	it('should count a revised word among the new ones', () => {
		const previous = assignRevealDelays(NO_DELAYS, ['0:a', '1:b', '2:c']);

		const delays = assignRevealDelays(previous, ['0:a', '1:b', '2:d', '3:e']);

		expect(delays.get('2:d')).toBe(0);
		expect(delays.get('3:e')).toBe(60);
	});

	it('should drop the keys that disappeared', () => {
		const previous = assignRevealDelays(NO_DELAYS, ['0:a', '1:b']);

		const delays = assignRevealDelays(previous, ['0:a']);

		expect([...delays.keys()]).toEqual(['0:a']);
	});
});
