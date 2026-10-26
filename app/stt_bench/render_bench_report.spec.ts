import { test } from '@japa/runner';

import { renderBenchReport } from '#stt_bench/render_bench_report';
import { buildReportFileName } from '#stt_bench/report_file_name';
import { buildSucceededResult } from '#tests/helpers/build_succeeded_result';

test.group('renderBenchReport', () => {
	test('should render the metadata, one row per sample, the aggregate and collapsible texts', ({
		assert,
	}) => {
		const report = renderBenchReport({
			generatedAt: new Date('2026-10-26T09:05:00Z'),
			providerName: 'mistral',
			sttModel: 'stt-model-x',
			cleanupModel: 'cleanup-model-y',
			results: [
				buildSucceededResult({ sampleName: 'memo', rawErrors: 2 }),
				{ status: 'failed', sampleName: 'broken', errorCode: 'E_AUDIO_X' },
			],
		});

		assert.include(report, '- Fournisseur : mistral');
		assert.include(report, '- Modèle STT : stt-model-x');
		assert.include(report, '- Modèle de nettoyage : cleanup-model-y');
		assert.include(
			report,
			'| memo | 12.3 s | 20.0 % | 2/0/0 | 0.0 % | 0/0/0 | 250 ms | 400 ms | 600 ms |'
		);
		assert.include(report, '| broken | échec : E_AUDIO_X |');
		assert.include(report, '## Agrégat');
		assert.include(
			report,
			'- WER brut (pondéré par le nombre de mots de référence) : 20.0 %'
		);
		assert.include(report, '<details>\n<summary>memo</summary>');
		assert.include(report, '**Référence**\n\nBonjour le monde.');
		assert.include(report, '**Brut**\n\nbonjour monde');
		assert.notInclude(report, '<summary>broken</summary>');
	});
});

test.group('buildReportFileName', () => {
	test('should name the report after local date, time and provider', ({
		assert,
	}) => {
		assert.equal(
			buildReportFileName(new Date(2026, 9, 26, 9, 5), 'mistral'),
			'2026-10-26-0905-mistral.md'
		);
	});
});
