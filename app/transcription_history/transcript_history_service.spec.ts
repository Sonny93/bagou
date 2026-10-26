import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import { TranscriptFactory } from '#database/factories/transcript_factory';
import { UserFactory } from '#database/factories/user_factory';
import { FixedClock } from '#tests/helpers/fixed_clock';
import Transcript from '#transcription_history/transcript';
import {
	TRANSCRIPTS_PER_PAGE,
	TranscriptHistoryService,
} from '#transcription_history/transcript_history_service';

const NOW = DateTime.fromISO('2026-06-01T10:00:00Z', { zone: 'utc' });
const RETENTION_DAYS = 60;

async function createService() {
	const user = await UserFactory.create();
	return { user, service: new TranscriptHistoryService(new FixedClock(NOW)) };
}

const daysAgo = (days: number): DateTime => NOW.minus({ days });

async function listTexts(
	service: TranscriptHistoryService,
	userId: number,
	query?: string
): Promise<(string | null)[]> {
	const transcripts = await service.list(userId, { query, page: 1 });
	return transcripts.all().map(({ cleanedText }) => cleanedText);
}

test.group('TranscriptHistoryService', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should keep the raw and the cleaned text of a dictation', async ({
		assert,
	}) => {
		const { service, user } = await createService();

		await service.save(user.id, {
			rawText: 'euh bonjour',
			cleanedText: 'Bonjour.',
		});

		const [transcript] = (await service.list(user.id, { page: 1 })).all();
		assert.equal(transcript?.rawText, 'euh bonjour');
		assert.equal(transcript?.cleanedText, 'Bonjour.');
		assert.equal(transcript?.createdAt.toMillis(), NOW.toMillis());
	});

	test('should keep a null cleaned text when the cleanup failed', async ({
		assert,
	}) => {
		const { service, user } = await createService();

		await service.save(user.id, { rawText: 'bonjour', cleanedText: null });

		const [transcript] = (await service.list(user.id, { page: 1 })).all();
		assert.isNull(transcript?.cleanedText);
	});

	test('should skip a blank raw text', async ({ assert }) => {
		const { service, user } = await createService();

		await service.save(user.id, { rawText: '  \n', cleanedText: '' });

		assert.lengthOf((await service.list(user.id, { page: 1 })).all(), 0);
	});

	test('should purge the rows of the user older than the retention when saving', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		const otherUser = await UserFactory.create();
		await TranscriptFactory.merge({
			userId: user.id,
			createdAt: daysAgo(RETENTION_DAYS + 1),
		}).create();
		const foreign = await TranscriptFactory.merge({
			userId: otherUser.id,
			createdAt: daysAgo(RETENTION_DAYS + 1),
		}).create();

		await service.save(user.id, { rawText: 'neuf', cleanedText: 'Neuf.' });

		const rows = await Transcript.query().where('userId', user.id);
		assert.lengthOf(rows, 1);
		assert.isNotNull(await Transcript.find(foreign.id));
	});

	test('should not list a row past the retention even when it is not purged', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'trop vieux',
			createdAt: daysAgo(RETENTION_DAYS + 1),
		}).create();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'encore bon',
			createdAt: daysAgo(RETENTION_DAYS - 1),
		}).create();

		assert.deepEqual(await listTexts(service, user.id), ['encore bon']);
	});

	test('should list only the rows of the user, newest first', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		const otherUser = await UserFactory.create();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'ancien',
			createdAt: daysAgo(2),
		}).create();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'récent',
			createdAt: daysAgo(1),
		}).create();
		await TranscriptFactory.merge({ userId: otherUser.id }).create();

		assert.deepEqual(await listTexts(service, user.id), ['récent', 'ancien']);
	});

	test('should paginate the rows', async ({ assert }) => {
		const { service, user } = await createService();
		await TranscriptFactory.merge({
			userId: user.id,
			createdAt: daysAgo(1),
		}).createMany(TRANSCRIPTS_PER_PAGE + 1);

		const firstPage = await service.list(user.id, { page: 1 });
		const secondPage = await service.list(user.id, { page: 2 });

		assert.lengthOf(firstPage.all(), TRANSCRIPTS_PER_PAGE);
		assert.lengthOf(secondPage.all(), 1);
	});

	test('should find a dictation by French stemming when the query is a plural', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'Une dictée sur le projet.',
		}).create();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'Les courses du soir.',
		}).create();

		assert.deepEqual(await listTexts(service, user.id, 'dictées'), [
			'Une dictée sur le projet.',
		]);
	});

	test('should find a dictation by trigram similarity when the query has a typo ("adonnis" for "Adonis", similarity 0.67 over the 0.6 threshold)', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: "Je code avec Adonis aujourd'hui.",
		}).create();
		await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'Les courses du soir.',
		}).create();

		assert.deepEqual(await listTexts(service, user.id, 'adonnis'), [
			"Je code avec Adonis aujourd'hui.",
		]);
	});

	test('should search the raw text when there is no cleaned text', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		await TranscriptFactory.merge({
			userId: user.id,
			rawText: 'euh un brouillon',
			cleanedText: null,
		}).create();

		const transcripts = await service.list(user.id, {
			query: 'brouillon',
			page: 1,
		});

		assert.lengthOf(transcripts.all(), 1);
	});

	test('should search only the rows of the user', async ({ assert }) => {
		const { service, user } = await createService();
		const otherUser = await UserFactory.create();
		await TranscriptFactory.merge({
			userId: otherUser.id,
			cleanedText: 'Une dictée secrète.',
		}).create();

		assert.deepEqual(await listTexts(service, user.id, 'dictée'), []);
	});

	test('should delete a row of the user', async ({ assert }) => {
		const { service, user } = await createService();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
		}).create();

		await service.delete(user.id, transcript.id);

		assert.isNull(await Transcript.find(transcript.id));
	});

	test('should throw not found and keep the row when it belongs to another user', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		const foreign = await TranscriptFactory.with('user').create();

		await assert.rejects(
			() => service.delete(user.id, foreign.id),
			'Dictée introuvable'
		);
		assert.isNotNull(await Transcript.find(foreign.id));
	});

	test('should throw not found when the row does not exist', async ({
		assert,
	}) => {
		const { service, user } = await createService();

		await assert.rejects(
			() => service.delete(user.id, 0),
			'Dictée introuvable'
		);
	});

	test('should delete all the rows of the user only', async ({ assert }) => {
		const { service, user } = await createService();
		await TranscriptFactory.merge({ userId: user.id }).createMany(2);
		const foreign = await TranscriptFactory.with('user').create();

		await service.deleteAll(user.id);

		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
		assert.isNotNull(await Transcript.find(foreign.id));
	});
});
