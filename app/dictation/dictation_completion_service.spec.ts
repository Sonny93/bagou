import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import { UserFactory } from '#database/factories/user_factory';
import { DictationCompletionService } from '#dictation/dictation_completion_service';
import { createRecordingLogger } from '#tests/helpers/create_recording_logger';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { FixedClock } from '#tests/helpers/fixed_clock';
import { TextCleanupService } from '#text_cleanup/text_cleanup_service';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';
import Transcript from '#transcription_history/transcript';
import type { TranscriptContent } from '#transcription_history/transcript_content';
import { TranscriptHistoryService } from '#transcription_history/transcript_history_service';

class FailingTranscriptHistoryService extends TranscriptHistoryService {
	override save(
		_userId: number,
		_transcript: Readonly<TranscriptContent>
	): Promise<void> {
		return Promise.reject(
			Object.assign(new Error('insert failed for texte secret'), {
				code: '23505',
				detail: 'Failing row contains (texte secret)',
			})
		);
	}
}

async function createService(
	textCleaner: FakeTextCleaner,
	historyService: TranscriptHistoryService = new TranscriptHistoryService(
		new FixedClock(DateTime.now()),
		new TextCleanupService(textCleaner)
	)
) {
	const { logger, lines } = createRecordingLogger();
	const user = await UserFactory.create();
	const service = new DictationCompletionService(
		new TextCleanupService(textCleaner),
		historyService,
		logger
	);
	return { service, user, lines };
}

test.group('DictationCompletionService', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should return the raw and the cleaned text when the cleanup succeeds', async ({
		assert,
	}) => {
		const { service, user } = await createService(new FakeTextCleaner());

		const transcript = await service.complete(user.id, 'euh bonjour');

		assert.deepEqual(transcript, {
			rawText: 'euh bonjour',
			cleanedText: 'EUH BONJOUR',
		});
	});

	test('should save the transcript in the history of the user', async ({
		assert,
	}) => {
		const { service, user } = await createService(new FakeTextCleaner());

		await service.complete(user.id, 'euh bonjour');

		const [saved] = await Transcript.query().where('userId', user.id);
		assert.equal(saved?.rawText, 'euh bonjour');
		assert.equal(saved?.cleanedText, 'EUH BONJOUR');
	});

	test('should return an empty cleaned text without calling the cleaner or saving when the raw text is blank', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();
		const { service, user } = await createService(textCleaner);

		const transcript = await service.complete(user.id, '  ');

		assert.deepEqual(transcript, { rawText: '  ', cleanedText: '' });
		assert.lengthOf(textCleaner.cleaned, 0);
		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
	});

	test('should return and save no cleaned text when the cleanup is unavailable', async ({
		assert,
	}) => {
		const { service, user } = await createService(
			new FakeTextCleaner(new TextCleanupUnavailableException())
		);

		const transcript = await service.complete(user.id, 'euh bonjour');

		assert.deepEqual(transcript, { rawText: 'euh bonjour', cleanedText: null });
		const [saved] = await Transcript.query().where('userId', user.id);
		assert.isNull(saved?.cleanedText);
	});

	test('should propagate any other cleanup error', async ({ assert }) => {
		const { service, user } = await createService(
			new FakeTextCleaner(new Error('boom'))
		);

		await assert.rejects(
			() => service.complete(user.id, 'euh bonjour'),
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
				new TextCleanupService(new FakeTextCleaner())
			)
		);

		const transcript = await service.complete(user.id, 'texte secret');

		assert.equal(transcript.cleanedText, 'TEXTE SECRET');
		const logs = lines.map((line) => JSON.parse(line));
		assert.include(logs.at(-1), {
			level: 50,
			msg: 'Transcript could not be saved',
			errorName: 'Error',
			errorCode: '23505',
		});
		assert.notInclude(lines.join('').toLowerCase(), 'secret');
	});

	test('should save the raw text without cleaned text nor calling the cleaner when keeping a raw text', async ({
		assert,
	}) => {
		const textCleaner = new FakeTextCleaner();
		const { service, user } = await createService(textCleaner);

		await service.keepRaw(user.id, 'euh bonjour');

		const [saved] = await Transcript.query().where('userId', user.id);
		assert.equal(saved?.rawText, 'euh bonjour');
		assert.isNull(saved?.cleanedText);
		assert.lengthOf(textCleaner.cleaned, 0);
	});

	test('should save nothing when the raw text to keep is blank', async ({
		assert,
	}) => {
		const { service, user } = await createService(new FakeTextCleaner());

		await service.keepRaw(user.id, '  ');

		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
	});

	test('should log the failure without any text when keeping the raw text fails to save', async ({
		assert,
	}) => {
		const { service, user, lines } = await createService(
			new FakeTextCleaner(),
			new FailingTranscriptHistoryService(
				new FixedClock(DateTime.now()),
				new TextCleanupService(new FakeTextCleaner())
			)
		);

		await service.keepRaw(user.id, 'texte secret');

		const logs = lines.map((line) => JSON.parse(line));
		assert.include(logs.at(-1), {
			level: 50,
			msg: 'Transcript could not be saved',
			errorCode: '23505',
		});
		assert.notInclude(lines.join('').toLowerCase(), 'secret');
	});
});
