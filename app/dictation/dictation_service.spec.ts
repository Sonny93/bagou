import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { setTimeout as sleep } from 'node:timers/promises';

import { UserFactory } from '#database/factories/user_factory';
import { UserSettingFactory } from '#database/factories/user_setting_factory';
import { Dictation } from '#dictation/dictation';
import { DictationCompletionService } from '#dictation/dictation_completion_service';
import { DictationErrorCode } from '#dictation/dictation_error_code';
import type { DictationErrorEvent } from '#dictation/dictation_error_event';
import { DictationService } from '#dictation/dictation_service';
import { DictationStartLimiter } from '#dictation/dictation_start_limiter';
import type { DictationTranscript } from '#dictation/dictation_transcript';
import { DictationQuotaService } from '#dictation_quota/dictation_quota_service';
import { Clock } from '#shared/clock';
import { createRecordingLogger } from '#tests/helpers/create_recording_logger';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { FakeTranscriptionProvider } from '#tests/helpers/fake_transcription_provider';
import { FakeTranscriptionSession } from '#tests/helpers/fake_transcription_session';
import { TextCleanupService } from '#text_cleanup/text_cleanup_service';
import type { OpenTranscriptionOptions } from '#transcription/open_transcription_options';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import { TranscriptionErrorCode } from '#transcription/transcription_error_code';
import { TranscriptionProvider } from '#transcription/transcription_provider';
import { TranscriptionProviderError } from '#transcription/transcription_provider_error';
import type { TranscriptionSession } from '#transcription/transcription_session';
import Transcript from '#transcription_history/transcript';
import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';
import UserSetting from '#user_settings/user_setting';
import { UserSettingsService } from '#user_settings/user_settings_service';

const DRAFT_CONTEXT = {
	draftId: '3f0a1c7e-9d54-4b6a-8e21-5c7d9a0b4f12',
	textBefore: 'Avant.',
	textAfter: '',
};
const PREVIEW_SETTINGS = {
	dictationLanguage: 'fr',
	vocabulary: ['Adonis', 'Voxtral'],
	cleanupInstructions: 'Use bullet points',
} as const;
const START_REQUESTS_PER_MINUTE = 20;
const SHORT_MAX_DURATION_MS = 20;
const DAILY_QUOTA_SECONDS = 60 * 60;
const DAILY_QUOTA_BYTES = DAILY_QUOTA_SECONDS * PCM_AUDIO_FORMAT.bytesPerSecond;

const AMPLE_REMAINING_BYTES = Number.MAX_SAFE_INTEGER;

type CreateDictationOptions = {
	maxDurationMs?: number;
	remainingBytes?: number;
	recordUsage?: (receivedBytes: number) => Promise<void>;
	complete?: (rawText: string) => Promise<DictationTranscript>;
	keepRaw?: (rawText: string) => Promise<void>;
};

const completeWithUppercase = async (
	rawText: string
): Promise<DictationTranscript> => ({
	rawText,
	cleanedDraft: rawText.toUpperCase(),
});

function createDictation(
	provider: TranscriptionProvider = new FakeTranscriptionProvider(),
	{
		maxDurationMs,
		remainingBytes = AMPLE_REMAINING_BYTES,
		recordUsage,
		complete = completeWithUppercase,
		keepRaw,
	}: Readonly<CreateDictationOptions> = {}
) {
	const { logger, lines } = createRecordingLogger();
	const recordedBytes: number[] = [];
	const keptRawTexts: string[] = [];
	const partials: string[] = [];
	const finals: string[] = [];
	const finisheds: string[] = [];
	const errors: DictationErrorEvent[] = [];
	const dictation = new Dictation(
		provider,
		logger,
		{
			onPartial: (text) => partials.push(text),
			onFinal: (text) => finals.push(text),
			onFinished: (text) => finisheds.push(text),
			onError: (event) => errors.push(event),
		},
		{
			language: 'fr',
			vocabulary: ['Adonis'],
			maxDurationMs,
			remainingBytes,
			complete,
			keepRaw:
				keepRaw ??
				(async (rawText) => {
					keptRawTexts.push(rawText);
				}),
			recordUsage:
				recordUsage ??
				(async (receivedBytes) => {
					recordedBytes.push(receivedBytes);
				}),
		}
	);
	return {
		dictation,
		lines,
		partials,
		finals,
		finisheds,
		errors,
		recordedBytes,
		keptRawTexts,
	};
}

const settleCancellation = (): Promise<void> => sleep(0);

const readLogs = (lines: readonly string[]): Record<string, unknown>[] =>
	lines.map((line) => JSON.parse(line));

class DeferredProvider extends TranscriptionProvider {
	readonly name = 'deferred';
	readonly session = new FakeTranscriptionSession();
	openingResolver: (session: TranscriptionSession) => void = () => undefined;

	open(
		_options: Readonly<OpenTranscriptionOptions>
	): Promise<TranscriptionSession> {
		return new Promise((resolve) => {
			this.openingResolver = resolve;
		});
	}
}

test.group('Dictation', () => {
	test('should open the provider session with the language and vocabulary of its options', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider();
		const { dictation } = createDictation(provider);

		await dictation.start();

		assert.deepEqual(provider.openedWith, [
			{ language: 'fr', vocabulary: ['Adonis'] },
		]);
		assert.isTrue(dictation.isActive);
	});

	test('should relay finals and partials of the session to the listener', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider();
		const { dictation, finals, partials } = createDictation(provider);
		await dictation.start();

		provider.session.simulateFinal('Bonjour');
		provider.session.simulatePartial(' le mon');

		assert.deepEqual(finals, ['Bonjour']);
		assert.deepEqual(partials, [' le mon']);
	});

	test('should forward audio to the session and count the received bytes', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider();
		const { dictation } = createDictation(provider);
		await dictation.start();

		dictation.appendAudio(new Uint8Array(3200));
		dictation.appendAudio(new Uint8Array(1600));

		assert.lengthOf(provider.session.sentAudio, 2);
		assert.equal(dictation.receivedBytes, 4800);
	});

	test('should resolve the transcript on stop and log the duration, provider and outcome without any text', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('texte secret')
		);
		const { dictation, lines } = createDictation(provider);
		await dictation.start();
		dictation.appendAudio(new Uint8Array(PCM_AUDIO_FORMAT.bytesPerSecond * 2));

		const transcript = await dictation.stop();

		assert.deepEqual(transcript, {
			rawText: 'texte secret',
			cleanedDraft: 'TEXTE SECRET',
		});
		const logs = readLogs(lines);
		assert.lengthOf(logs, 1);
		assert.include(logs[0], {
			provider: 'fake',
			outcome: 'completed',
			durationSeconds: 2,
		});
		assert.notInclude(lines.join(''), 'secret');
		assert.isFalse(dictation.isActive);
	});

	test('should tell the listener the finished text before completing it', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('texte brut')
		);
		const completedTexts: string[] = [];
		const { dictation, finisheds } = createDictation(provider, {
			complete: async (rawText) => {
				completedTexts.push(rawText);
				return { rawText, cleanedDraft: null };
			},
		});
		await dictation.start();

		await dictation.stop();

		assert.deepEqual(finisheds, ['texte brut']);
		assert.deepEqual(completedTexts, ['texte brut']);
	});

	test('should complete the text when the maximum duration is reached', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('texte long')
		);
		const { dictation, finisheds } = createDictation(provider, {
			maxDurationMs: SHORT_MAX_DURATION_MS,
		});
		await dictation.start();

		await sleep(SHORT_MAX_DURATION_MS * 3);

		assert.deepEqual(finisheds, ['texte long']);
		assert.deepEqual(await dictation.stop(), {
			rawText: 'texte long',
			cleanedDraft: 'TEXTE LONG',
		});
	});

	test('should reject stop without logging the text when the completion fails', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('texte secret')
		);
		const { dictation, lines } = createDictation(provider, {
			complete: () => Promise.reject(new Error('cleanup down')),
		});
		await dictation.start();

		await assert.rejects(() => dictation.stop(), /cleanup down/);

		assert.notInclude(lines.join(''), 'secret');
	});

	test('should log the failure without any text when the completion fails at the maximum duration', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('texte secret')
		);
		const { dictation, lines } = createDictation(provider, {
			maxDurationMs: SHORT_MAX_DURATION_MS,
			complete: () =>
				Promise.reject(
					Object.assign(new Error('failed on texte secret'), {
						detail: 'Failing row contains (texte secret)',
					})
				),
		});
		await dictation.start();

		await sleep(SHORT_MAX_DURATION_MS * 3);

		const failure = readLogs(lines).find(
			({ msg }) => msg === 'Dictation could not be completed'
		);
		assert.equal(failure?.level, 50);
		assert.notInclude(lines.join(''), 'secret');
	});

	test('should not log a provider error twice when it fails the finish at the maximum duration', async ({
		assert,
	}) => {
		const session = new FakeTranscriptionSession('texte');
		session.finish = () =>
			Promise.reject(
				new TranscriptionProviderError(
					TranscriptionErrorCode.connectionClosed,
					'closed'
				)
			);
		const { dictation, lines } = createDictation(
			new FakeTranscriptionProvider(session),
			{ maxDurationMs: SHORT_MAX_DURATION_MS }
		);
		await dictation.start();

		await sleep(SHORT_MAX_DURATION_MS * 3);

		assert.isUndefined(
			readLogs(lines).find(
				({ msg }) => msg === 'Dictation could not be completed'
			)
		);
	});

	test('should reject audio once stopped', async ({ assert }) => {
		const { dictation } = createDictation();
		await dictation.start();
		await dictation.stop();

		assert.throws(
			() => dictation.appendAudio(new Uint8Array(2)),
			/E_DICTATION_NOT_ACTIVE/
		);
	});

	test('should tell the listener only the error code when the provider fails', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider();
		const { dictation, errors, lines } = createDictation(provider);
		await dictation.start();

		provider.session.simulateError(
			new TranscriptionProviderError(
				TranscriptionErrorCode.connectionClosed,
				'socket hang up with internal details'
			)
		);

		assert.deepEqual(errors, [
			{
				code: TranscriptionErrorCode.connectionClosed,
			},
		]);
		assert.equal(provider.session.abortCount, 1);
		assert.isFalse(dictation.isActive);
		assert.include(readLogs(lines).at(-1), { outcome: 'failed' });
	});

	test('should log the provider and error code, never the message, when the provider cannot open', async ({
		assert,
	}) => {
		const openError = new TranscriptionProviderError(
			TranscriptionErrorCode.connectionFailed,
			'secret provider text'
		);
		const provider = new FakeTranscriptionProvider(undefined, openError);
		const { dictation, lines } = createDictation(provider);

		await assert.rejects(() => dictation.start());

		assert.include(readLogs(lines).at(-2), {
			provider: provider.name,
			code: TranscriptionErrorCode.connectionFailed,
		});
		assert.notInclude(lines.join(''), 'secret provider text');
	});

	test('should abort the session once when cancelled twice', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider();
		const { dictation, lines } = createDictation(provider);
		await dictation.start();

		dictation.cancel();
		dictation.cancel();
		await settleCancellation();

		assert.equal(provider.session.abortCount, 1);
		const logs = readLogs(lines);
		assert.lengthOf(logs, 1);
		assert.include(logs[0], { outcome: 'cancelled' });
	});

	test('should fail to start and log it when the provider cannot open', async ({
		assert,
	}) => {
		const openError = new TranscriptionProviderError(
			TranscriptionErrorCode.connectionFailed,
			'unreachable'
		);
		const provider = new FakeTranscriptionProvider(undefined, openError);
		const { dictation, lines } = createDictation(provider);

		await assert.rejects(() => dictation.start(), /unreachable/);

		assert.isFalse(dictation.isActive);
		assert.include(readLogs(lines).at(-1), { outcome: 'failed' });
	});

	test('should abort a session that opens after the dictation was cancelled', async ({
		assert,
	}) => {
		const provider = new DeferredProvider();
		const { dictation } = createDictation(provider);
		const starting = dictation.start();

		dictation.cancel();
		provider.openingResolver(provider.session);

		await assert.rejects(() => starting, /E_DICTATION_NOT_ACTIVE/);
		assert.equal(provider.session.abortCount, 1);
	});

	test('should finish by itself with an error event at the maximum duration, keeping the text available to stop', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('texte long')
		);
		const { dictation, errors, lines } = createDictation(provider, {
			maxDurationMs: SHORT_MAX_DURATION_MS,
		});
		await dictation.start();

		await sleep(SHORT_MAX_DURATION_MS * 3);

		assert.deepEqual(
			errors.map(({ code }) => code),
			[DictationErrorCode.tooLong]
		);
		assert.equal((await dictation.stop()).rawText, 'texte long');
		assert.equal(provider.session.finishCount, 1);
		assert.include(readLogs(lines).at(-1), { outcome: 'timed_out' });
	});
});

test.group('Dictation usage', () => {
	test('should finish with a quota error and keep the text when the remaining budget is spent', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('texte gardé')
		);
		const { dictation, errors, lines } = createDictation(provider, {
			remainingBytes: 3200,
		});
		await dictation.start();

		dictation.appendAudio(new Uint8Array(1600));
		assert.lengthOf(errors, 0);
		dictation.appendAudio(new Uint8Array(1600));

		assert.deepEqual(errors, [
			{
				code: DictationErrorCode.quotaExceeded,
			},
		]);
		assert.equal((await dictation.stop()).rawText, 'texte gardé');
		assert.equal(provider.session.finishCount, 1);
		const logs = readLogs(lines);
		assert.include(logs.at(-1), { outcome: 'quota_exceeded' });
		assert.include(logs.at(-2), { msg: 'Daily dictation quota reached' });
		assert.throws(
			() => dictation.appendAudio(new Uint8Array(2)),
			/E_DICTATION_NOT_ACTIVE/
		);
	});

	test('should record the received bytes once when completed', async ({
		assert,
	}) => {
		const { dictation, recordedBytes } = createDictation();
		await dictation.start();
		dictation.appendAudio(new Uint8Array(3200));
		dictation.appendAudio(new Uint8Array(1600));

		await dictation.stop();

		assert.deepEqual(recordedBytes, [4800]);
	});

	test('should record the received bytes once when cancelled twice', async ({
		assert,
	}) => {
		const { dictation, recordedBytes } = createDictation();
		await dictation.start();
		dictation.appendAudio(new Uint8Array(3200));

		dictation.cancel();
		dictation.cancel();
		await settleCancellation();

		assert.deepEqual(recordedBytes, [3200]);
	});

	test('should flush the session then keep only the raw text when cancelled while active', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('texte brut')
		);
		const { dictation, keptRawTexts, finisheds, lines } =
			createDictation(provider);
		await dictation.start();

		dictation.cancel();
		await settleCancellation();

		assert.equal(provider.session.finishCount, 1);
		assert.deepEqual(keptRawTexts, ['texte brut']);
		assert.lengthOf(finisheds, 0);
		assert.isFalse(dictation.isActive);
		assert.include(readLogs(lines).at(-1), { outcome: 'cancelled' });
	});

	test('should not abort the session before it is flushed when cancelled', async ({
		assert,
	}) => {
		const abortCountsWhenFlushed: number[] = [];
		const session = new FakeTranscriptionSession('texte');
		const flush = session.finish.bind(session);
		session.finish = async () => {
			abortCountsWhenFlushed.push(session.abortCount);
			return flush();
		};
		const { dictation } = createDictation(
			new FakeTranscriptionProvider(session)
		);
		await dictation.start();

		dictation.cancel();
		await settleCancellation();

		assert.deepEqual(abortCountsWhenFlushed, [0]);
		assert.equal(session.abortCount, 1);
	});

	test('should not call the completer when cancelled', async ({ assert }) => {
		let completeCount = 0;
		const { dictation } = createDictation(undefined, {
			complete: async (rawText) => {
				completeCount += 1;
				return { rawText, cleanedDraft: null };
			},
		});
		await dictation.start();

		dictation.cancel();
		await settleCancellation();

		assert.equal(completeCount, 0);
	});

	test('should keep nothing when cancelled before the session is open', async ({
		assert,
	}) => {
		const provider = new DeferredProvider();
		const { dictation, keptRawTexts } = createDictation(provider);
		const starting = dictation.start();

		dictation.cancel();
		provider.openingResolver(provider.session);
		await assert.rejects(() => starting);
		await settleCancellation();

		assert.lengthOf(keptRawTexts, 0);
		assert.equal(provider.session.finishCount, 0);
	});

	test('should let a running stop win when cancelled while finishing', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('texte')
		);
		const { dictation, keptRawTexts } = createDictation(provider);
		await dictation.start();

		const stopping = dictation.stop();
		dictation.cancel();
		const transcript = await stopping;

		assert.deepEqual(transcript, { rawText: 'texte', cleanedDraft: 'TEXTE' });
		assert.equal(provider.session.finishCount, 1);
		assert.lengthOf(keptRawTexts, 0);
	});

	test('should end as failed, abort and keep nothing when the flush fails on cancel', async ({
		assert,
	}) => {
		const session = new FakeTranscriptionSession();
		session.finish = async () => {
			throw new Error('flush failed');
		};
		const { dictation, keptRawTexts, lines } = createDictation(
			new FakeTranscriptionProvider(session)
		);
		await dictation.start();

		dictation.cancel();
		await settleCancellation();

		assert.lengthOf(keptRawTexts, 0);
		assert.equal(session.abortCount, 1);
		assert.include(readLogs(lines).at(-2), { outcome: 'failed' });
		assert.include(readLogs(lines).at(-1), { errorName: 'Error' });
	});

	test('should record the received bytes once when the provider fails', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider();
		const { dictation, recordedBytes } = createDictation(provider);
		await dictation.start();
		dictation.appendAudio(new Uint8Array(3200));

		provider.session.simulateError(
			new TranscriptionProviderError(
				TranscriptionErrorCode.connectionClosed,
				'closed'
			)
		);

		assert.deepEqual(recordedBytes, [3200]);
	});

	test('should record the received bytes once when timed out', async ({
		assert,
	}) => {
		const { dictation, recordedBytes } = createDictation(undefined, {
			maxDurationMs: SHORT_MAX_DURATION_MS,
		});
		await dictation.start();
		dictation.appendAudio(new Uint8Array(3200));

		await sleep(SHORT_MAX_DURATION_MS * 3);
		await dictation.stop();

		assert.deepEqual(recordedBytes, [3200]);
	});

	test('should record the received bytes once when the quota is reached', async ({
		assert,
	}) => {
		const { dictation, recordedBytes } = createDictation(undefined, {
			remainingBytes: 1600,
		});
		await dictation.start();

		dictation.appendAudio(new Uint8Array(1600));
		await dictation.stop();

		assert.deepEqual(recordedBytes, [1600]);
	});

	test('should record nothing when no audio was received', async ({
		assert,
	}) => {
		const { dictation, recordedBytes } = createDictation();
		await dictation.start();

		await dictation.stop();

		assert.deepEqual(recordedBytes, []);
	});

	test('should log the failure without throwing when the usage cannot be recorded', async ({
		assert,
	}) => {
		const { dictation, lines } = createDictation(undefined, {
			recordUsage: () => Promise.reject(new Error('database down')),
		});
		await dictation.start();
		dictation.appendAudio(new Uint8Array(3200));

		await assert.doesNotReject(() => dictation.stop());
		await sleep(0);

		const failure = readLogs(lines).find(
			({ msg }) => msg === 'Dictation usage could not be recorded'
		);
		assert.isDefined(failure);
		assert.equal(failure?.level, 50);
	});
});

test.group('DictationService', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	const listener = {
		onPartial: () => undefined,
		onFinal: () => undefined,
		onFinished: () => undefined,
		onError: () => undefined,
	};

	async function createService(
		provider = new FakeTranscriptionProvider(),
		textCleaner = new FakeTextCleaner()
	) {
		const { logger, lines } = createRecordingLogger();
		const quotaService = new DictationQuotaService(new Clock());
		const service = new DictationService(
			provider,
			logger,
			quotaService,
			new DictationStartLimiter(logger),
			new DictationCompletionService(
				new TextCleanupService(textCleaner),
				new TranscriptHistoryService(
					new Clock(),
					new TextCleanupService(textCleaner),
					new UserSettingsService()
				),
				logger
			),
			new UserSettingsService()
		);
		const user = await UserFactory.create();
		return { service, quotaService, user, provider, lines, textCleaner };
	}

	test('should create a dictation on the injected provider that is not started yet', async ({
		assert,
	}) => {
		const { service, user, provider } = await createService();

		const dictation = await service.create(user.id, DRAFT_CONTEXT, listener);

		assert.isFalse(dictation.isActive);
		await dictation.start();
		assert.lengthOf(provider.openedWith, 1);
	});

	test('should record the audio of the dictation on the user usage when it ends', async ({
		assert,
	}) => {
		const { service, quotaService, user } = await createService();
		const dictation = await service.create(user.id, DRAFT_CONTEXT, listener);
		await dictation.start();
		dictation.appendAudio(new Uint8Array(3200));

		await dictation.stop();
		await sleep(50);

		assert.equal((await quotaService.getUsage(user.id)).usedBytes, 3200);
	});

	test('should clean the whole draft around the segment with the injected text cleaner', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('euh bonjour')
		);
		const { service, user, textCleaner } = await createService(provider);
		const dictation = await service.create(user.id, DRAFT_CONTEXT, listener);
		await dictation.start();

		const transcript = await dictation.stop();

		assert.deepEqual(transcript, {
			rawText: 'euh bonjour',
			cleanedDraft: 'AVANT. EUH BONJOUR',
		});
		assert.deepEqual(textCleaner.cleaned, ['Avant. euh bonjour']);
	});

	test('should open the provider session with the language and vocabulary of the user settings', async ({
		assert,
	}) => {
		const { service, user, provider } = await createService();
		await UserSettingFactory.merge({
			userId: user.id,
			dictationLanguage: 'fr',
			vocabulary: ['Adonis', 'Voxtral'],
		}).create();

		const dictation = await service.create(user.id, DRAFT_CONTEXT, listener);
		await dictation.start();

		assert.deepEqual(provider.openedWith, [
			{ language: 'fr', vocabulary: ['Adonis', 'Voxtral'] },
		]);
	});

	test('should open the provider session in English with no vocabulary when the user never saved settings', async ({
		assert,
	}) => {
		const { service, user, provider } = await createService();

		const dictation = await service.create(user.id, DRAFT_CONTEXT, listener);
		await dictation.start();

		assert.deepEqual(provider.openedWith, [{ language: 'en', vocabulary: [] }]);
	});

	test('should clean with the preferences of the user settings', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('um hello')
		);
		const { service, user, textCleaner } = await createService(provider);
		await UserSettingFactory.merge({
			userId: user.id,
			vocabulary: ['Adonis'],
			cleanupInstructions: 'Use bullet points',
		}).create();
		const dictation = await service.create(user.id, DRAFT_CONTEXT, listener);
		await dictation.start();

		await dictation.stop();

		assert.deepEqual(textCleaner.receivedPreferences, [
			{
				language: 'en',
				vocabulary: ['Adonis'],
				instructions: 'Use bullet points',
			},
		]);
	});

	test('should refuse to create a dictation once the daily quota is spent, logging the user', async ({
		assert,
	}) => {
		const { service, quotaService, user, provider, lines } =
			await createService();
		await quotaService.record(user.id, DAILY_QUOTA_BYTES);

		await assert.rejects(
			() => service.create(user.id, DRAFT_CONTEXT, listener),
			/E_DICTATION_QUOTA_EXCEEDED/
		);

		assert.lengthOf(provider.openedWith, 0);
		assert.include(readLogs(lines).at(-1), {
			userId: user.id,
			usedSeconds: DAILY_QUOTA_SECONDS,
		});
	});

	test('should give the dictation only the remaining budget of the day', async ({
		assert,
	}) => {
		const { service, quotaService, user } = await createService();
		await quotaService.record(user.id, DAILY_QUOTA_BYTES - 3200);
		const errors: DictationErrorEvent[] = [];
		const dictation = await service.create(user.id, DRAFT_CONTEXT, {
			...listener,
			onError: (event) => errors.push(event),
		});
		await dictation.start();

		dictation.appendAudio(new Uint8Array(3200));

		assert.deepEqual(
			errors.map(({ code }) => code),
			[DictationErrorCode.quotaExceeded]
		);
	});

	test('should open the preview session with the given language and vocabulary, not the saved ones', async ({
		assert,
	}) => {
		const { service, user, provider } = await createService();
		await UserSettingFactory.merge({
			userId: user.id,
			dictationLanguage: 'en',
			vocabulary: ['Saved'],
		}).create();

		const dictation = await service.createPreview(
			user.id,
			PREVIEW_SETTINGS,
			listener
		);
		await dictation.start();

		assert.deepEqual(provider.openedWith, [
			{ language: 'fr', vocabulary: ['Adonis', 'Voxtral'] },
		]);
	});

	test('should clean only the raw segment with the given preferences and keep the history untouched', async ({
		assert,
	}) => {
		const provider = new FakeTranscriptionProvider(
			new FakeTranscriptionSession('euh bonjour')
		);
		const { service, user, textCleaner } = await createService(provider);
		const dictation = await service.createPreview(
			user.id,
			PREVIEW_SETTINGS,
			listener
		);
		await dictation.start();

		const transcript = await dictation.stop();

		assert.deepEqual(transcript, {
			rawText: 'euh bonjour',
			cleanedDraft: 'EUH BONJOUR',
		});
		assert.deepEqual(textCleaner.cleaned, ['euh bonjour']);
		assert.deepEqual(textCleaner.receivedPreferences, [
			{
				language: 'fr',
				vocabulary: ['Adonis', 'Voxtral'],
				instructions: 'Use bullet points',
			},
		]);
		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
		assert.lengthOf(await UserSetting.query().where('userId', user.id), 0);
	});

	test('should keep nothing when a preview is cancelled', async ({
		assert,
	}) => {
		const { service, user, textCleaner } = await createService();
		const dictation = await service.createPreview(
			user.id,
			PREVIEW_SETTINGS,
			listener
		);
		await dictation.start();

		dictation.cancel();
		await sleep(50);

		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
		assert.lengthOf(textCleaner.cleaned, 0);
	});

	test('should count the audio of a preview in the daily quota', async ({
		assert,
	}) => {
		const { service, quotaService, user } = await createService();
		const dictation = await service.createPreview(
			user.id,
			PREVIEW_SETTINGS,
			listener
		);
		await dictation.start();
		dictation.appendAudio(new Uint8Array(3200));

		await dictation.stop();
		await sleep(50);

		assert.equal((await quotaService.getUsage(user.id)).usedBytes, 3200);
	});

	test('should refuse to create a preview once the daily quota is spent', async ({
		assert,
	}) => {
		const { service, quotaService, user, provider } = await createService();
		await quotaService.record(user.id, DAILY_QUOTA_BYTES);

		await assert.rejects(
			() => service.createPreview(user.id, PREVIEW_SETTINGS, listener),
			/E_DICTATION_QUOTA_EXCEEDED/
		);

		assert.lengthOf(provider.openedWith, 0);
	});

	test('should share the start rate limit between dictations and previews', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		for (let attempt = 0; attempt < START_REQUESTS_PER_MINUTE; attempt += 1) {
			await service.create(user.id, DRAFT_CONTEXT, listener);
		}

		await assert.rejects(
			() => service.createPreview(user.id, PREVIEW_SETTINGS, listener),
			/E_DICTATION_RATE_LIMITED/
		);
	});
});
