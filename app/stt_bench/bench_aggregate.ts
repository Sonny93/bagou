export type LatencyStatistics = {
	meanMs: number | undefined;
	medianMs: number | undefined;
};

export type BenchAggregate = {
	succeededCount: number;
	failedCount: number;
	rawErrorRatePercent: number | undefined;
	cleanedErrorRatePercent: number | undefined;
	timeToFirstFinal: LatencyStatistics;
	finishLatency: LatencyStatistics;
	cleanupLatency: LatencyStatistics;
};
