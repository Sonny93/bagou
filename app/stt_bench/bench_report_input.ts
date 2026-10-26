import type { BenchSampleResult } from '#stt_bench/bench_sample_result';

export type BenchReportInput = {
	generatedAt: Date;
	providerName: string;
	sttModel: string;
	cleanupModel: string;
	results: readonly BenchSampleResult[];
};
