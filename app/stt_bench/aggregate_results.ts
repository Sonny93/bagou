import type {
	BenchAggregate,
	LatencyStatistics,
} from '#stt_bench/bench_aggregate';
import type {
	BenchSampleResult,
	SucceededSampleResult,
} from '#stt_bench/bench_sample_result';
import type { WerScore } from '#stt_bench/wer_score';

const PERCENT = 100;
const MIDDLE_DIVISOR = 2;

function summarizeLatencies(latencies: readonly number[]): LatencyStatistics {
	if (latencies.length === 0) return { meanMs: undefined, medianMs: undefined };
	const sorted = latencies.toSorted((first, second) => first - second);
	const middle = Math.floor(sorted.length / MIDDLE_DIVISOR);
	const medianMs =
		sorted.length % MIDDLE_DIVISOR === 0
			? (sorted[middle - 1] + sorted[middle]) / MIDDLE_DIVISOR
			: sorted[middle];
	const meanMs =
		sorted.reduce((total, latency) => total + latency, 0) / sorted.length;
	return { meanMs, medianMs };
}

function weightByReferenceWords(
	scores: readonly WerScore[]
): number | undefined {
	if (scores.length === 0) return undefined;
	const wordCount = scores.reduce(
		(total, score) => total + score.referenceWordCount,
		0
	);
	const errorCount = scores.reduce(
		(total, score) =>
			total + score.substitutions + score.deletions + score.insertions,
		0
	);
	return wordCount === 0
		? Math.min(errorCount, 1) * PERCENT
		: (errorCount / wordCount) * PERCENT;
}

/** WER is weighted by reference word count; latencies skip missing values. */
export function aggregateResults(
	results: readonly BenchSampleResult[]
): BenchAggregate {
	const succeeded = results.filter(
		(result): result is SucceededSampleResult => result.status === 'succeeded'
	);
	return {
		succeededCount: succeeded.length,
		failedCount: results.length - succeeded.length,
		rawErrorRatePercent: weightByReferenceWords(
			succeeded.map((result) => result.rawScore)
		),
		cleanedErrorRatePercent: weightByReferenceWords(
			succeeded.map((result) => result.cleanedScore)
		),
		timeToFirstFinal: summarizeLatencies(
			succeeded.flatMap((result) => result.timeToFirstFinalMs ?? [])
		),
		finishLatency: summarizeLatencies(
			succeeded.map((result) => result.finishLatencyMs)
		),
		cleanupLatency: summarizeLatencies(
			succeeded.map((result) => result.cleanupLatencyMs)
		),
	};
}
