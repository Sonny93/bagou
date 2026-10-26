import { aggregateResults } from '#stt_bench/aggregate_results';
import type {
	BenchAggregate,
	LatencyStatistics,
} from '#stt_bench/bench_aggregate';
import type { BenchReportInput } from '#stt_bench/bench_report_input';
import type {
	BenchSampleResult,
	SucceededSampleResult,
} from '#stt_bench/bench_sample_result';
import {
	formatMilliseconds,
	formatPercent,
	formatSeconds,
} from '#stt_bench/format_metrics';
import type { WerScore } from '#stt_bench/wer_score';

const TABLE_HEADER = [
	'| Échantillon | Durée | WER brut | S/D/I brut | WER nettoyé | S/D/I nettoyé | Premier final | Fin audio → texte | Nettoyage |',
	'| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
];
const TABLE_COLUMN_COUNT = 9;
const EMPTY_CELL = '';

const formatEdits = (score: WerScore): string =>
	`${score.substitutions}/${score.deletions}/${score.insertions}`;

const formatLatencies = ({ meanMs, medianMs }: LatencyStatistics): string =>
	`moy. ${formatMilliseconds(meanMs)}, méd. ${formatMilliseconds(medianMs)}`;

function renderSampleRow(result: BenchSampleResult): string {
	if (result.status === 'failed') {
		const failureCells = Array<string>(TABLE_COLUMN_COUNT - 2).fill(EMPTY_CELL);
		return `| ${[result.sampleName, `échec : ${result.errorCode}`, ...failureCells].join(' | ')} |`;
	}
	return `| ${[
		result.sampleName,
		formatSeconds(result.audioDurationSeconds),
		formatPercent(result.rawScore.errorRatePercent),
		formatEdits(result.rawScore),
		formatPercent(result.cleanedScore.errorRatePercent),
		formatEdits(result.cleanedScore),
		formatMilliseconds(result.timeToFirstFinalMs),
		formatMilliseconds(result.finishLatencyMs),
		formatMilliseconds(result.cleanupLatencyMs),
	].join(' | ')} |`;
}

function renderAggregate(aggregate: BenchAggregate): string[] {
	return [
		'## Agrégat',
		'',
		`- Échantillons réussis : ${aggregate.succeededCount}, en échec : ${aggregate.failedCount}`,
		`- WER brut (pondéré par le nombre de mots de référence) : ${formatPercent(aggregate.rawErrorRatePercent)}`,
		`- WER nettoyé (pondéré) : ${formatPercent(aggregate.cleanedErrorRatePercent)}`,
		`- Premier final : ${formatLatencies(aggregate.timeToFirstFinal)}`,
		`- Fin audio → texte : ${formatLatencies(aggregate.finishLatency)}`,
		`- Nettoyage Haiku : ${formatLatencies(aggregate.cleanupLatency)}`,
	];
}

function renderDetails(result: SucceededSampleResult): string[] {
	return [
		'<details>',
		`<summary>${result.sampleName}</summary>`,
		'',
		'**Référence**',
		'',
		result.referenceText,
		'',
		'**Brut**',
		'',
		result.rawText,
		'',
		'**Nettoyé**',
		'',
		result.cleanedText,
		'',
		'</details>',
		'',
	];
}

/** The French report written to `bench/results/`; it contains transcript text. */
export function renderBenchReport(input: Readonly<BenchReportInput>): string {
	const succeeded = input.results.filter(
		(result): result is SucceededSampleResult => result.status === 'succeeded'
	);
	return [
		`# Benchmark STT : ${input.providerName}`,
		'',
		`- Date : ${input.generatedAt.toISOString()}`,
		`- Fournisseur : ${input.providerName}`,
		`- Modèle STT : ${input.sttModel}`,
		`- Modèle de nettoyage : ${input.cleanupModel}`,
		'',
		'## Échantillons',
		'',
		...TABLE_HEADER,
		...input.results.map(renderSampleRow),
		'',
		...renderAggregate(aggregateResults(input.results)),
		'',
		'## Textes',
		'',
		...succeeded.flatMap(renderDetails),
	].join('\n');
}
