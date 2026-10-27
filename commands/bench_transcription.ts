import { args, BaseCommand, flags } from '@adonisjs/core/ace';
import type { CommandOptions } from '@adonisjs/core/types/ace';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { parseDictationLanguage } from '#shared/parse_dictation_language';
import { UnknownDictationLanguageError } from '#shared/unknown_dictation_language_error';
import { aggregateResults } from '#stt_bench/aggregate_results';
import { BENCH_PROVIDER_REGISTRY } from '#stt_bench/bench_provider_registry';
import { BenchRunner } from '#stt_bench/bench_runner';
import type { BenchSample } from '#stt_bench/bench_sample';
import type { BenchSampleResult } from '#stt_bench/bench_sample_result';
import { convertAudioWithFfmpeg } from '#stt_bench/convert_audio_with_ffmpeg';
import { discoverSamples } from '#stt_bench/discover_samples';
import {
	formatMilliseconds,
	formatPercent,
	formatSeconds,
} from '#stt_bench/format_metrics';
import { renderBenchReport } from '#stt_bench/render_bench_report';
import { buildReportFileName } from '#stt_bench/report_file_name';
import { selectProviderNames } from '#stt_bench/select_provider_names';
import { UnknownBenchProviderError } from '#stt_bench/unknown_bench_provider_error';
import { TextCleaner } from '#text_cleanup/text_cleaner';
import { TEXT_CLEANUP_MODEL } from '#text_cleanup/text_cleanup_model';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import { TranscriptionProvider } from '#transcription/transcription_provider';

const DEFAULT_LANGUAGE: string = 'fr';
const DEFAULT_SAMPLES_DIRECTORY = 'bench/samples';
const RESULTS_DIRECTORY = 'bench/results';

export default class BenchTranscription extends BaseCommand {
	static commandName = 'transcription:bench';
	static description =
		'Measure transcription accuracy and latency, before and after cleanup, on recorded samples';
	static options: CommandOptions = { startApp: true };

	@args.string({
		description: `Directory of <name>.<audio> + <name>.txt pairs (default ${DEFAULT_SAMPLES_DIRECTORY})`,
		required: false,
	})
	declare directory: string | undefined;

	@flags.string({
		description: 'Provider name, or "all" for every registered provider',
	})
	declare provider: string | undefined;

	@flags.number({ description: 'Run only the first n samples' })
	declare limit: number | undefined;

	@flags.string({
		description: 'Language of the samples (fr or en)',
		default: DEFAULT_LANGUAGE,
	})
	declare language: string;

	async run() {
		try {
			await this.#benchSelectedProviders();
		} catch (error) {
			if (
				!(error instanceof UnknownBenchProviderError) &&
				!(error instanceof UnknownDictationLanguageError)
			) {
				throw error;
			}
			this.logger.error(`${error.code}: ${error.message}`);
			this.exitCode = 1;
		}
	}

	async #benchSelectedProviders() {
		const boundProvider = await this.app.container.make(TranscriptionProvider);
		const providerNames = selectProviderNames({
			requestedName: this.provider,
			boundName: boundProvider.name,
			registeredNames: Object.keys(BENCH_PROVIDER_REGISTRY),
		});
		const samples = await this.#loadSamples();
		const runner = new BenchRunner(
			convertAudioWithFfmpeg,
			await this.app.container.make(TextCleaner)
		);
		for (const providerName of providerNames) {
			await this.#benchProvider(runner, providerName, samples);
		}
	}

	async #loadSamples() {
		const discovered = await discoverSamples(
			this.directory ?? DEFAULT_SAMPLES_DIRECTORY
		);
		for (const name of discovered.namesWithoutReference) {
			this.logger.warning(`Skipping ${name}: no reference .txt file`);
		}
		return discovered.samples.slice(0, this.limit);
	}

	async #benchProvider(
		runner: BenchRunner,
		providerName: string,
		samples: readonly BenchSample[]
	) {
		const entry = BENCH_PROVIDER_REGISTRY[providerName];
		this.logger.info(`Provider ${providerName}: ${samples.length} sample(s)`);
		const results = await runner.run({
			language: parseDictationLanguage(this.language),
			provider: entry.createProvider(),
			samples,
			chunkIntervalMs: PCM_AUDIO_FORMAT.chunkDurationMs,
			onSampleCompleted: (result) => this.#logProgress(result),
		});
		this.#printSummary(results);
		await this.#writeReport(providerName, entry.sttModel, results);
	}

	#logProgress(result: BenchSampleResult) {
		if (result.status === 'failed') {
			this.logger.error(`${result.sampleName}: failed (${result.errorCode})`);
			return;
		}
		this.logger.success(
			`${result.sampleName} (${formatSeconds(result.audioDurationSeconds)}): done`
		);
	}

	#printSummary(results: readonly BenchSampleResult[]) {
		const table = this.ui.table();
		table.head([
			'Sample',
			'Duration',
			'WER raw',
			'WER cleaned',
			'First final',
			'End to text',
			'Cleanup',
		]);
		for (const result of results) {
			table.row(
				result.status === 'failed'
					? [result.sampleName, result.errorCode, '', '', '', '', '']
					: [
							result.sampleName,
							formatSeconds(result.audioDurationSeconds),
							formatPercent(result.rawScore.errorRatePercent),
							formatPercent(result.cleanedScore.errorRatePercent),
							formatMilliseconds(result.timeToFirstFinalMs),
							formatMilliseconds(result.finishLatencyMs),
							formatMilliseconds(result.cleanupLatencyMs),
						]
			);
		}
		const aggregate = aggregateResults(results);
		table.row([
			'ALL (weighted WER, mean latency)',
			'',
			formatPercent(aggregate.rawErrorRatePercent),
			formatPercent(aggregate.cleanedErrorRatePercent),
			formatMilliseconds(aggregate.timeToFirstFinal.meanMs),
			formatMilliseconds(aggregate.finishLatency.meanMs),
			formatMilliseconds(aggregate.cleanupLatency.meanMs),
		]);
		table.render();
	}

	async #writeReport(
		providerName: string,
		sttModel: string,
		results: readonly BenchSampleResult[]
	) {
		const generatedAt = new Date();
		const reportPath = join(
			this.app.makePath(RESULTS_DIRECTORY),
			buildReportFileName(generatedAt, providerName)
		);
		await mkdir(this.app.makePath(RESULTS_DIRECTORY), { recursive: true });
		await writeFile(
			reportPath,
			renderBenchReport({
				generatedAt,
				providerName,
				sttModel,
				cleanupModel: TEXT_CLEANUP_MODEL,
				results,
			})
		);
		this.logger.info(`Report: ${reportPath}`);
	}
}
