import type { SucceededSampleResult } from '#stt_bench/bench_sample_result';

type SucceededResultOverrides = {
	sampleName?: string;
	referenceWordCount?: number;
	rawErrors?: number;
	timeToFirstFinalMs?: number | undefined;
	finishLatencyMs?: number;
};

/** Builds a succeeded result whose raw score has `rawErrors` substitutions. */
export function buildSucceededResult(
	overrides: Readonly<SucceededResultOverrides> = {}
): SucceededSampleResult {
	const referenceWordCount = overrides.referenceWordCount ?? 10;
	const rawErrors = overrides.rawErrors ?? 0;
	return {
		status: 'succeeded',
		sampleName: overrides.sampleName ?? 'sample',
		audioDurationSeconds: 12.34,
		referenceText: 'Bonjour le monde.',
		rawText: 'bonjour monde',
		cleanedText: 'Bonjour le monde.',
		rawScore: {
			errorRatePercent: (rawErrors / referenceWordCount) * 100,
			substitutions: rawErrors,
			deletions: 0,
			insertions: 0,
			referenceWordCount,
		},
		cleanedScore: {
			errorRatePercent: 0,
			substitutions: 0,
			deletions: 0,
			insertions: 0,
			referenceWordCount,
		},
		timeToFirstFinalMs:
			'timeToFirstFinalMs' in overrides ? overrides.timeToFirstFinalMs : 250,
		finishLatencyMs: overrides.finishLatencyMs ?? 400,
		cleanupLatencyMs: 600,
	};
}
