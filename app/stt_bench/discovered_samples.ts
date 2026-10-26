import type { BenchSample } from '#stt_bench/bench_sample';

export type DiscoveredSamples = {
	samples: BenchSample[];
	namesWithoutReference: string[];
};
