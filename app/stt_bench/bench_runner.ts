import type { AudioConverter } from '#stt_bench/audio_converter';
import type { BenchSample } from '#stt_bench/bench_sample';
import type {
	BenchSampleResult,
	SucceededSampleResult,
} from '#stt_bench/bench_sample_result';
import { computeWer } from '#stt_bench/compute_wer';
import { describeErrorCode } from '#stt_bench/describe_error_code';
import type { TextCleaner } from '#text_cleanup/text_cleaner';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import type { TranscriptionProvider } from '#transcription/transcription_provider';
import { TranscriptionStreamService } from '#transcription/transcription_stream_service';

export type RunBenchOptions = {
	provider: TranscriptionProvider;
	samples: readonly BenchSample[];
	chunkIntervalMs: number;
	onSampleCompleted: (result: BenchSampleResult) => void;
};

/**
 * Runs samples one after the other, streamed in real time through the
 * transcription port, then through the text cleaner. A failing sample is
 * recorded by error code and never stops the run.
 */
export class BenchRunner {
	constructor(
		private readonly convertAudio: AudioConverter,
		private readonly textCleaner: TextCleaner
	) {}

	async run(options: Readonly<RunBenchOptions>): Promise<BenchSampleResult[]> {
		const results: BenchSampleResult[] = [];
		for (const sample of options.samples) {
			const result = await this.#runSample(sample, options);
			results.push(result);
			options.onSampleCompleted(result);
		}
		return results;
	}

	async #runSample(
		sample: BenchSample,
		{ provider, chunkIntervalMs }: Readonly<RunBenchOptions>
	): Promise<BenchSampleResult> {
		try {
			return await this.#measureSample(sample, provider, chunkIntervalMs);
		} catch (error) {
			return {
				status: 'failed',
				sampleName: sample.name,
				errorCode: describeErrorCode(error),
			};
		}
	}

	async #measureSample(
		sample: BenchSample,
		provider: TranscriptionProvider,
		chunkIntervalMs: number
	): Promise<SucceededSampleResult> {
		const pcm = await this.convertAudio(sample.audioPath);
		const streamed = await new TranscriptionStreamService(provider).stream({
			pcm,
			chunkIntervalMs,
			onFinal: () => undefined,
		});
		const cleanupStartedAt = performance.now();
		const cleanedText = await this.textCleaner.clean(streamed.text);
		return {
			status: 'succeeded',
			sampleName: sample.name,
			audioDurationSeconds: pcm.byteLength / PCM_AUDIO_FORMAT.bytesPerSecond,
			referenceText: sample.referenceText,
			rawText: streamed.text,
			cleanedText,
			rawScore: computeWer(sample.referenceText, streamed.text),
			cleanedScore: computeWer(sample.referenceText, cleanedText),
			timeToFirstFinalMs: streamed.timeToFirstFinalMs,
			finishLatencyMs: streamed.finishLatencyMs,
			cleanupLatencyMs: performance.now() - cleanupStartedAt,
		};
	}
}
