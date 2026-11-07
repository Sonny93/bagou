import { describe, expect, it } from 'vitest';

import {
	claimBatches,
	settleBatch,
	trackPairs,
	untrackPair,
} from '~/correction_suggestions/shared/track_pushes';

const buildPair = (index: number) => ({
	heard: `heard ${index}`,
	written: `written ${index}`,
});

const claimFirstBatch = () => {
	const { tracked, batches } = claimBatches(
		trackPairs([], [buildPair(1)], 'draft-1'),
		20
	);
	const [batch] = batches;
	if (batch === undefined) throw new Error('Expected a batch');
	return { tracked, batch };
};

describe('track_pushes', () => {
	it('should not track a pair twice when it is staged again, ignoring case', () => {
		const tracked = trackPairs([], [buildPair(1)], 'draft-1');

		const result = trackPairs(
			tracked,
			[{ heard: 'HEARD 1', written: 'written 1' }, buildPair(2)],
			'draft-2'
		);

		expect(result.map((entry) => [entry.pair, entry.draftId])).toEqual([
			[buildPair(1), 'draft-1'],
			[buildPair(2), 'draft-2'],
		]);
	});

	it('should claim only the waiting pairs when some were already claimed', () => {
		const tracked = trackPairs([], [buildPair(1)], 'draft-1');
		const first = claimBatches(tracked, 20);
		const withNew = trackPairs(first.tracked, [buildPair(2)], 'draft-1');

		const second = claimBatches(withNew, 20);

		expect(first.batches).toEqual([
			{ draftId: 'draft-1', pairs: [buildPair(1)] },
		]);
		expect(second.batches).toEqual([
			{ draftId: 'draft-1', pairs: [buildPair(2)] },
		]);
	});

	it('should group the claimed pairs by draft and cap each batch when there are many', () => {
		const first = trackPairs(
			[],
			Array.from({ length: 25 }, (_, index) => buildPair(index)),
			'draft-1'
		);
		const tracked = trackPairs(first, [buildPair(100)], 'draft-2');

		const { batches } = claimBatches(tracked, 20);

		expect(batches.map((batch) => [batch.draftId, batch.pairs.length])).toEqual(
			[
				['draft-1', 20],
				['draft-1', 5],
				['draft-2', 1],
			]
		);
	});

	it('should not claim a pair again once its batch is sent', () => {
		const { tracked, batch } = claimFirstBatch();
		const settled = settleBatch(tracked, batch, 'sent');

		expect(claimBatches(settled, 20).batches).toEqual([]);
	});

	it('should claim a pair again when its batch failed', () => {
		const { tracked, batch } = claimFirstBatch();
		const settled = settleBatch(tracked, batch, 'waiting');

		expect(claimBatches(settled, 20).batches).toEqual([batch]);
	});

	it('should claim nothing for a pair that was untracked', () => {
		const tracked = trackPairs([], [buildPair(1)], 'draft-1');

		const result = claimBatches(untrackPair(tracked, buildPair(1)), 20);

		expect(result.batches).toEqual([]);
	});
});
