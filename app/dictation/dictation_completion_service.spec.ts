import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import { UserFactory } from '#database/factories/user_factory';
import { DictationCompletionService } from '#dictation/dictation_completion_service';
import { FRENCH_CLEANUP_PREFERENCES } from '#tests/helpers/cleanup_preferences_fixture';
import { createRecordingLogger } from '#tests/helpers/create_recording_logger';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { FixedClock } from '#tests/helpers/fixed_clock';
import { TextCleanupService } from '#text_cleanup/text_cleanup_service';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';
import type { DraftSegment } from '#transcription_history/draft_segment';
import Transcript from '#transcription_history/transcript';
import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';
import { UserSettingsService } from '#user_settings/user_settings_service';

class FailingTranscriptHistoryService extends TranscriptHistoryService {
	override appendSegment(
		_userId: number,
		_draftId: string,
		_segment: Readonly<DraftSegment>
	): Promise<void> {
		return Promise.reject(
			Object.assign(new Error('insert failed for texte secret'), {
				code: '23505',
				detail: 'Failing row contains (texte secret)',
			})
		);
	}
}

const DRAFT = {
	draftId: '3f0a1c7e-9d54-4b6a-8e21-5c7d9a0b4f12',
	textBefore: 'Avant.',
	textAfter: 'Après.',
};

function createServiceFor(
	textCleaner: FakeTextCleaner,
	historyService: TranscriptHistoryService = new TranscriptHistoryService(
		new FixedClock(DateTime.now()),
		new TextCleanupService(textCleaner),
		new UserSettingsService()
	)
) {
	const { logger, lines } = createRecordingLogger();
	const service = new DictationCompletionService(
		new TextCleanupService(textCleaner),
		historyService,
		logger
	);
	return { service, lines };
}

async function createService(
	textCleaner: FakeTextCleaner,
	historyService?: TranscriptHistoryService
) {
	const user = await UserFactory.create();
	return { ...createServiceFor(textCleaner, historyService), user };
}

test.group('DictationCompletionService', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should return the raw segment and the cleaned draft when the cleanup succeeds', async ({
		assert,
	}) => {
		const { service, user } = await createService(new FakeTextCleaner());

		const transcript = await service.complete(
			user.id,
			DRAFT,
			'euh bonjour',
			FRENCH_CLEANUP_PREFERENCES
		);

		assert.deepEqual(transcript, {
			rawText: 'euh bonjour',
			cleanedDraft: 'AVANT. EUH BONJOUR APRÈS.',
		});
	});

	test('should clean with the given preferences', async ({ assert }) => {
		const textCleaner = new FakeTextCleaner();
		const { service, user } = await createService(textCleaner);
		const preferences = {
			language: 'en',
			vocabulary: ['Adonis'],
			instructions: 'Use bullet points',
		} as const;

		await service.complete(user.id, DRAFT, 'um hello', preferences);

		assert.deepEqual(textCleaner.receivedPreferences, [preferences]);
	});

	test('should clean the whole draft with the segment between the text before and after', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();
		const { service, user } = await createService(textCleaner);

		await service.complete(
			user.id,
			DRAFT,
			' euh bonjour ',
			FRENCH_CLEANUP_PREFERENCES
		);

		assert.deepEqual(textCleaner.cleaned, ['Avant. euh bonjour Après.']);
	});

	test('should save the raw segment and the cleaned draft in the entry of the draft', async ({
		assert,
	}) => {
		const { service, user } = await createService(new FakeTextCleaner());

		await service.complete(
			user.id,
			DRAFT,
			'euh bonjour',
			FRENCH_CLEANUP_PREFERENCES
		);

		const [saved] = await Transcript.query().where('userId', user.id);
		assert.equal(saved?.draftId, DRAFT.draftId);
		assert.equal(saved?.rawText, 'euh bonjour');
		assert.equal(saved?.cleanedText, 'AVANT. EUH BONJOUR APRÈS.');
	});

	test('should return no cleaned draft without calling the cleaner nor saving when the raw segment is blank', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();
		const { service, user } = await createService(textCleaner);

		const transcript = await service.complete(
			user.id,
			DRAFT,
			'  ',
			FRENCH_CLEANUP_PREFERENCES
		);

		assert.deepEqual(transcript, { rawText: '  ', cleanedDraft: null });
		assert.lengthOf(textCleaner.cleaned, 0);
		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
	});

	test('should return no cleaned draft and keep the raw segment when the cleanup is unavailable', async ({
		assert,
	}) => {
		const { service, user } = await createService(
			new FakeTextCleaner(new TextCleanupUnavailableException())
		);

		const transcript = await service.complete(
			user.id,
			DRAFT,
			'euh bonjour',
			FRENCH_CLEANUP_PREFERENCES
		);

		assert.deepEqual(transcript, {
			rawText: 'euh bonjour',
			cleanedDraft: null,
		});
		const [saved] = await Transcript.query().where('userId', user.id);
		assert.equal(saved?.rawText, 'euh bonjour');
		assert.isNull(saved?.cleanedText);
	});

	test('should keep the cleaned draft already saved when a later cleanup is unavailable', async ({
		assert,
	}) => {
		const { service, user } = await createService(new FakeTextCleaner());
		await service.complete(user.id, DRAFT, 'un', FRENCH_CLEANUP_PREFERENCES);
		const failing = createServiceFor(
			new FakeTextCleaner(new TextCleanupUnavailableException())
		);

		await failing.service.complete(
			user.id,
			DRAFT,
			'deux',
			FRENCH_CLEANUP_PREFERENCES
		);

		const [saved] = await Transcript.query().where('userId', user.id);
		assert.equal(saved?.rawText, 'un deux');
		assert.equal(saved?.cleanedText, 'AVANT. UN APRÈS.');
	});

	test('should propagate any other cleanup error', async ({ assert }) => {
		const { service, user } = await createService(
			new FakeTextCleaner(new Error('boom'))
		);

		await assert.rejects(
			() =>
				service.complete(
					user.id,
					DRAFT,
					'euh bonjour',
					FRENCH_CLEANUP_PREFERENCES
				),
			/boom/
		);
	});

	test('should still return the transcript and log the failure without any text when the save fails', async ({
		assert,
	}) => {
		const { service, user, lines } = await createService(
			new FakeTextCleaner(),
			new FailingTranscriptHistoryService(
				new FixedClock(DateTime.now()),
				new TextCleanupService(new FakeTextCleaner()),
				new UserSettingsService()
			)
		);

		const transcript = await service.complete(
			user.id,
			DRAFT,
			'texte secret',
			FRENCH_CLEANUP_PREFERENCES
		);

		assert.equal(transcript.cleanedDraft, 'AVANT. TEXTE SECRET APRÈS.');
		const logs = lines.map((line) => JSON.parse(line));
		assert.include(logs.at(-1), {
			level: 50,
			msg: 'Transcript could not be saved',
			errorName: 'Error',
			errorCode: '23505',
		});
		assert.notInclude(lines.join('').toLowerCase(), 'secret');
	});

	test('should save the raw segment without cleaned text nor calling the cleaner when keeping a raw segment', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();
		const { service, user } = await createService(textCleaner);

		await service.keepRaw(user.id, DRAFT.draftId, 'euh bonjour');

		const [saved] = await Transcript.query().where('userId', user.id);
		assert.equal(saved?.rawText, 'euh bonjour');
		assert.isNull(saved?.cleanedText);
		assert.lengthOf(textCleaner.cleaned, 0);
	});

	test('should append a kept raw segment to the entry of the draft', async ({
		assert,
	}) => {
		const { service, user } = await createService(new FakeTextCleaner());
		await service.complete(user.id, DRAFT, 'un', FRENCH_CLEANUP_PREFERENCES);

		await service.keepRaw(user.id, DRAFT.draftId, 'deux');

		const [saved] = await Transcript.query().where('userId', user.id);
		assert.equal(saved?.rawText, 'un deux');
		assert.equal(saved?.cleanedText, 'AVANT. UN APRÈS.');
	});

	test('should save nothing when the raw segment to keep is blank', async ({
		assert,
	}) => {
		const { service, user } = await createService(new FakeTextCleaner());

		await service.keepRaw(user.id, DRAFT.draftId, '  ');

		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
	});

	test('should log the failure without any text when keeping the raw segment fails to save', async ({
		assert,
	}) => {
		const { service, user, lines } = await createService(
			new FakeTextCleaner(),
			new FailingTranscriptHistoryService(
				new FixedClock(DateTime.now()),
				new TextCleanupService(new FakeTextCleaner()),
				new UserSettingsService()
			)
		);

		await service.keepRaw(user.id, DRAFT.draftId, 'texte secret');

		const logs = lines.map((line) => JSON.parse(line));
		assert.include(logs.at(-1), {
			level: 50,
			msg: 'Transcript could not be saved',
			errorCode: '23505',
		});
		assert.notInclude(lines.join('').toLowerCase(), 'secret');
	});

	test('should clean the raw segment alone and save nothing when completing a preview', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();
		const { service, user } = await createService(textCleaner);

		const transcript = await service.completePreview(
			'euh bonjour',
			FRENCH_CLEANUP_PREFERENCES
		);

		assert.deepEqual(transcript, {
			rawText: 'euh bonjour',
			cleanedDraft: 'EUH BONJOUR',
		});
		assert.deepEqual(textCleaner.cleaned, ['euh bonjour']);
		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
	});

	test('should not call the cleaner for a blank preview segment', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();
		const { service } = await createService(textCleaner);

		const transcript = await service.completePreview(
			'  ',
			FRENCH_CLEANUP_PREFERENCES
		);

		assert.deepEqual(transcript, { rawText: '  ', cleanedDraft: null });
		assert.lengthOf(textCleaner.cleaned, 0);
	});

	test('should yield no cleaned text when the preview cleanup is unavailable', async ({
		assert,
	}) => {
		const { service } = await createService(
			new FakeTextCleaner(new TextCleanupUnavailableException())
		);

		const transcript = await service.completePreview(
			'bonjour',
			FRENCH_CLEANUP_PREFERENCES
		);

		assert.deepEqual(transcript, { rawText: 'bonjour', cleanedDraft: null });
	});
});
