import { describe, expect, it } from 'vitest';

import { describeDeletionCount } from './describe_deletion_count';

describe('describeDeletionCount', () => {
	it('should use the singular when one dictation is deleted', () => {
		expect(describeDeletionCount(1)).toBe(
			'1 dictée sera supprimée définitivement.'
		);
	});

	it('should use the plural when several dictations are deleted', () => {
		expect(describeDeletionCount(12)).toBe(
			'12 dictées seront supprimées définitivement.'
		);
	});
});
