import { test } from '@japa/runner';

import { aggregateResults } from '#stt_bench/aggregate_results';
import { buildSucceededResult } from '#tests/helpers/build_succeeded_result';

test.group('aggregateResults', () => {
	test('should weight the WER by reference word count and ignore failed samples', ({
		assert,
	}) => {
		const aggregate = aggregateResults([
			buildSucceededResult({ referenceWordCount: 10, rawErrors: 1 }),
			buildSucceededResult({ referenceWordCount: 30, rawErrors: 9 }),
			{ status: 'failed', sampleName: 'broken', errorCode: 'E_X' },
		]);

		assert.equal(aggregate.succeededCount, 2);
		assert.equal(aggregate.failedCount, 1);
		assert.equal(aggregate.rawErrorRatePercent, 25);
	});

	test('should compute mean and median latencies, skipping missing first finals', ({
		assert,
	}) => {
		const aggregate = aggregateResults([
			buildSucceededResult({ timeToFirstFinalMs: 100, finishLatencyMs: 10 }),
			buildSucceededResult({ timeToFirstFinalMs: 300, finishLatencyMs: 20 }),
			buildSucceededResult({
				timeToFirstFinalMs: undefined,
				finishLatencyMs: 90,
			}),
		]);

		assert.deepEqual(aggregate.timeToFirstFinal, {
			meanMs: 200,
			medianMs: 200,
		});
		assert.deepEqual(aggregate.finishLatency, { meanMs: 40, medianMs: 20 });
	});

	test('should report no figures when nothing succeeded', ({ assert }) => {
		const aggregate = aggregateResults([]);

		assert.isUndefined(aggregate.rawErrorRatePercent);
		assert.isUndefined(aggregate.timeToFirstFinal.meanMs);
	});
});
