import { test } from '@japa/runner';

import {
	AudioConversionError,
	AudioConversionErrorCode,
} from '#stt_bench/audio_conversion_error';
import { BenchRunner } from '#stt_bench/bench_runner';
import type { BenchSample } from '#stt_bench/bench_sample';
import type { BenchSampleResult } from '#stt_bench/bench_sample_result';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { FakeTranscriptionProvider } from '#tests/helpers/fake_transcription_provider';
import { FakeTranscriptionSession } from '#tests/helpers/fake_transcription_session';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';

const TWO_SECONDS_PCM = new Uint8Array(PCM_AUDIO_FORMAT.bytesPerSecond * 2);

const buildSample = (name: string): BenchSample => ({
	name,
	audioPath: `/samples/${name}.wav`,
	referenceText: 'Bonjour le monde.',
});

test.group('BenchRunner', () => {
	test('should score the raw and cleaned texts and report durations and latencies', async ({
		assert,
	}) => {
		const cleaner = new FakeTextCleaner();
		const runner = new BenchRunner(async () => TWO_SECONDS_PCM, cleaner);
		const completed: BenchSampleResult[] = [];

		const results = await runner.run({
			language: 'fr',
			provider: new FakeTranscriptionProvider(
				new FakeTranscriptionSession('bonjour monde')
			),
			samples: [buildSample('memo')],
			chunkIntervalMs: 0,
			onSampleCompleted: (result) => completed.push(result),
		});

		const [result] = results;
		assert.equal(result.status, 'succeeded');
		if (result.status !== 'succeeded') return;
		assert.equal(result.audioDurationSeconds, 2);
		assert.equal(result.rawText, 'bonjour monde');
		assert.equal(result.cleanedText, 'BONJOUR MONDE');
		assert.equal(result.rawScore.deletions, 1);
		assert.equal(result.cleanedScore.deletions, 1);
		assert.isAtLeast(result.finishLatencyMs, 0);
		assert.isAtLeast(result.cleanupLatencyMs, 0);
		assert.deepEqual(cleaner.cleaned, ['bonjour monde']);
		assert.deepEqual(completed, results);
	});

	test('should record the error code of a failing sample and carry on with the next', async ({
		assert,
	}) => {
		const runner = new BenchRunner(async (audioPath) => {
			if (audioPath.includes('broken')) {
				throw new AudioConversionError(
					AudioConversionErrorCode.ffmpegMissing,
					'ffmpeg is not installed'
				);
			}
			return TWO_SECONDS_PCM;
		}, new FakeTextCleaner());

		const results = await runner.run({
			language: 'fr',
			provider: new FakeTranscriptionProvider(),
			samples: [buildSample('broken'), buildSample('fine')],
			chunkIntervalMs: 0,
			onSampleCompleted: () => undefined,
		});

		assert.deepEqual(results[0], {
			status: 'failed',
			sampleName: 'broken',
			errorCode: AudioConversionErrorCode.ffmpegMissing,
		});
		assert.equal(results[1].status, 'succeeded');
	});

	test('should record a failing cleanup as a failed sample', async ({
		assert,
	}) => {
		const failure = Object.assign(new Error('boom'), { code: 'E_CLEANUP' });
		const runner = new BenchRunner(
			async () => TWO_SECONDS_PCM,
			new FakeTextCleaner(failure)
		);

		const [result] = await runner.run({
			language: 'fr',
			provider: new FakeTranscriptionProvider(),
			samples: [buildSample('memo')],
			chunkIntervalMs: 0,
			onSampleCompleted: () => undefined,
		});

		assert.deepEqual(result, {
			status: 'failed',
			sampleName: 'memo',
			errorCode: 'E_CLEANUP',
		});
	});
});
