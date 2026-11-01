import { describe, expect, it } from 'vitest';

import { canStartNewDictation } from './can_start_new_dictation';

describe('canStartNewDictation', () => {
	it.each(['done', 'cancelled', 'error'] as const)(
		'should allow it when the status is %s, even with a blank draft',
		(status) => {
			expect(canStartNewDictation(status, '')).toBe(true);
		}
	);

	it('should allow it when the page is idle and the draft has text', () => {
		expect(canStartNewDictation('idle', 'Typed text')).toBe(true);
	});

	it('should not allow it when the page is idle and the draft is blank', () => {
		expect(canStartNewDictation('idle', '  \n')).toBe(false);
	});

	it.each(['connecting', 'recording', 'finishing'] as const)(
		'should not allow it when the status is %s',
		(status) => {
			expect(canStartNewDictation(status, 'Some text')).toBe(false);
		}
	);
});
