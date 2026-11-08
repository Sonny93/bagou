import { describe, expect, it } from 'vitest';

import { findNextUnresolvedKey } from '~/correction_suggestions/shared/find_next_unresolved_key';

const KEYS = ['a', 'b', 'c', 'd'];

describe('findNextUnresolvedKey', () => {
	it('should return the next row when it is unresolved', () => {
		expect(findNextUnresolvedKey(KEYS, new Set(['b']), 'b')).toBe('c');
	});

	it('should skip the resolved rows after it', () => {
		expect(findNextUnresolvedKey(KEYS, new Set(['b', 'c']), 'b')).toBe('d');
	});

	it('should return the closest unresolved row above when none is left below', () => {
		expect(findNextUnresolvedKey(KEYS, new Set(['b', 'c', 'd']), 'd')).toBe(
			'a'
		);
	});

	it('should skip a row that is still being handled when it is in the skipped keys', () => {
		expect(findNextUnresolvedKey(KEYS, new Set(['b', 'c']), 'a')).toBe('d');
	});

	it('should return null when every row is resolved', () => {
		expect(findNextUnresolvedKey(KEYS, new Set(KEYS), 'c')).toBeNull();
	});
});
