import { describe, expect, it } from 'vitest';

import { chunkItems } from '~/correction_suggestions/shared/chunk_items';

describe('chunkItems', () => {
	it('should split the items into chunks of at most the size when there are more than one chunk', () => {
		expect(chunkItems([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
	});

	it('should return one chunk when the items fit in it', () => {
		expect(chunkItems([1, 2], 20)).toEqual([[1, 2]]);
	});

	it('should return no chunk when there are no items', () => {
		expect(chunkItems([], 20)).toEqual([]);
	});
});
