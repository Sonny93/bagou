import type { WerScore } from '#stt_bench/wer_score';

export type SucceededSampleResult = {
	status: 'succeeded';
	sampleName: string;
	audioDurationSeconds: number;
	referenceText: string;
	rawText: string;
	cleanedText: string;
	rawScore: WerScore;
	cleanedScore: WerScore;
	timeToFirstFinalMs: number | undefined;
	finishLatencyMs: number;
	cleanupLatencyMs: number;
};

type FailedSampleResult = {
	status: 'failed';
	sampleName: string;
	errorCode: string;
};

export type BenchSampleResult = SucceededSampleResult | FailedSampleResult;
