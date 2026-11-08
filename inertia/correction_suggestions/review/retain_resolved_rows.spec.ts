import { describe, expect, it } from 'vitest';

import { retainResolvedRows } from '~/correction_suggestions/review/retain_resolved_rows';
import type { ReviewItem } from '~/correction_suggestions/shared/build_review_list';

const buildItem = (key: string): ReviewItem => ({
	key,
	heard: `heard ${key}`,
	written: `written ${key}`,
	createdAt: null,
});

const getKeys = (items: readonly ReviewItem[]): string[] =>
	items.map((item) => item.key);

describe('retainResolvedRows', () => {
	it('should keep a resolved row in place when the server no longer lists it', () => {
		const previous = [buildItem('a'), buildItem('b'), buildItem('c')];
		const current = [buildItem('b'), buildItem('c')];

		const rows = retainResolvedRows(previous, current, new Set(['a']));

		expect(getKeys(rows)).toEqual(['a', 'b', 'c']);
	});

	it('should drop an unresolved row when the server no longer lists it', () => {
		const previous = [buildItem('a'), buildItem('b')];
		const current = [buildItem('b')];

		const rows = retainResolvedRows(previous, current, new Set());

		expect(getKeys(rows)).toEqual(['b']);
	});

	it('should append the rows the server lists for the first time', () => {
		const previous = [buildItem('a')];
		const current = [buildItem('n'), buildItem('a')];

		const rows = retainResolvedRows(previous, current, new Set());

		expect(getKeys(rows)).toEqual(['a', 'n']);
	});
});
