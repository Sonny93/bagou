import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import { TranscriptFactory } from '#database/factories/transcript_factory';
import { UserFactory } from '#database/factories/user_factory';
import { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { FixedClock } from '#tests/helpers/fixed_clock';
import { TextCleanupService } from '#text_cleanup/text_cleanup_service';
import TextCleanupUnavailableException from '#text_cleanup/text_cleanup_unavailable_exception';
import Transcript from '#transcription_history/transcript';
import {
	TRANSCRIPTS_PER_PAGE,
	TranscriptHistoryService,
} from '#transcription_history/transcript_history_service';

const NOW = DateTime.fromISO('2026-06-01T10:00:00Z', { zone: 'utc' });
const RETENTION_DAYS = 60;
const DRAFT_ID = '3f0a1c7e-9d54-4b6a-8e21-5c7d9a0b4f12';
const OTHER_DRAFT_ID = '9b2e4d68-1f3a-4c5b-8d7e-6a0f2c4e8b13';

async function createService(textCleaner = new FakeTextCleaner()) {
	const user = await UserFactory.create();
	const service = new TranscriptHistoryService(
		new FixedClock(NOW),
		new TextCleanupService(textCleaner)
	);
	return { user, service, textCleaner };
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

	test('should create the entry of a draft with the raw segment and the cleaned draft', async ({
		assert,
	}) => {
		const { service, user } = await createService();

		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'euh bonjour',
			cleanedDraft: 'Bonjour.',
		});

		const [transcript] = (await service.list(user.id, { page: 1 })).all();
		assert.equal(transcript?.rawText, 'euh bonjour');
		assert.equal(transcript?.cleanedText, 'Bonjour.');
		assert.equal(transcript?.draftId, DRAFT_ID);
		assert.equal(transcript?.createdAt.toMillis(), NOW.toMillis());
	});

	test('should keep a null cleaned text when the first segment was not cleaned', async ({
		assert,
	}) => {
		const { service, user } = await createService();

		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'bonjour',
			cleanedDraft: null,
		});

		const [transcript] = (await service.list(user.id, { page: 1 })).all();
		assert.isNull(transcript?.cleanedText);
	});

	test('should append a segment to the entry of its draft and replace the cleaned draft', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'euh bonjour',
			cleanedDraft: 'Bonjour.',
		});

		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'et salut',
			cleanedDraft: 'Bonjour. Et salut.',
		});

		const rows = await Transcript.query().where('userId', user.id);
		assert.lengthOf(rows, 1);
		assert.equal(rows[0]?.rawText, 'euh bonjour et salut');
		assert.equal(rows[0]?.cleanedText, 'Bonjour. Et salut.');
	});

	test('should keep the cleaned draft already stored when a later segment was not cleaned', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'euh bonjour',
			cleanedDraft: 'Bonjour.',
		});

		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'et salut',
			cleanedDraft: null,
		});

		const [row] = await Transcript.query().where('userId', user.id);
		assert.equal(row?.rawText, 'euh bonjour et salut');
		assert.equal(row?.cleanedText, 'Bonjour.');
	});

	test('should keep one entry per draft', async ({ assert }) => {
		const { service, user } = await createService();

		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'un',
			cleanedDraft: 'Un.',
		});
		await service.appendSegment(user.id, OTHER_DRAFT_ID, {
			rawSegment: 'deux',
			cleanedDraft: 'Deux.',
		});

		assert.lengthOf(await Transcript.query().where('userId', user.id), 2);
	});

	test('should not append to the entry of the same draft id of another user', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		const otherUser = await UserFactory.create();
		await service.appendSegment(otherUser.id, DRAFT_ID, {
			rawSegment: 'autre',
			cleanedDraft: 'Autre.',
		});

		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'un',
			cleanedDraft: 'Un.',
		});

		const [foreign] = await Transcript.query().where('userId', otherUser.id);
		assert.equal(foreign?.rawText, 'autre');
		assert.lengthOf(await Transcript.query().where('userId', user.id), 1);
	});

	test('should skip a blank raw segment', async ({ assert }) => {
		const { service, user } = await createService();

		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: '  \n',
			cleanedDraft: '',
		});

		assert.lengthOf((await service.list(user.id, { page: 1 })).all(), 0);
	});

	test('should purge the rows of the user older than the retention when appending a segment', async ({
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

		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'neuf',
			cleanedDraft: 'Neuf.',
		});

		const rows = await Transcript.query().where('userId', user.id);
		assert.lengthOf(rows, 1);
		assert.isNotNull(await Transcript.find(foreign.id));
	});

	test('should start a new entry when the entry of the draft is past the retention', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		await TranscriptFactory.merge({
			userId: user.id,
			draftId: DRAFT_ID,
			rawText: 'vieux',
			createdAt: daysAgo(RETENTION_DAYS + 1),
		}).create();

		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'neuf',
			cleanedDraft: 'Neuf.',
		});

		const [row, ...others] = await Transcript.query().where('userId', user.id);
		assert.lengthOf(others, 0);
		assert.equal(row?.rawText, 'neuf');
	});

	test('should replace the cleaned text of the entry of the draft with the text as the user left it', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'euh bonjour',
			cleanedDraft: 'Bonjour.',
		});

		await service.saveDraftText(user.id, DRAFT_ID, 'Bonjour à tous.');

		const [row] = await Transcript.query().where('userId', user.id);
		assert.equal(row?.cleanedText, 'Bonjour à tous.');
		assert.equal(row?.rawText, 'euh bonjour');
	});

	test('should clear the cleaned text when the saved draft text is blank', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		await service.appendSegment(user.id, DRAFT_ID, {
			rawSegment: 'euh bonjour',
			cleanedDraft: 'Bonjour.',
		});

		await service.saveDraftText(user.id, DRAFT_ID, '  ');

		const [row] = await Transcript.query().where('userId', user.id);
		assert.isNull(row?.cleanedText);
	});

	test('should save nothing when no segment of the draft was kept', async ({
		assert,
	}) => {
		const { service, user } = await createService();

		await service.saveDraftText(user.id, DRAFT_ID, 'Tapé à la main.');

		assert.lengthOf(await Transcript.query().where('userId', user.id), 0);
	});

	test('should not touch the entry of the same draft id of another user when saving the draft text', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		const otherUser = await UserFactory.create();
		await service.appendSegment(otherUser.id, DRAFT_ID, {
			rawSegment: 'autre',
			cleanedDraft: 'Autre.',
		});

		await service.saveDraftText(user.id, DRAFT_ID, 'Modifié.');

		const [foreign] = await Transcript.query().where('userId', otherUser.id);
		assert.equal(foreign?.cleanedText, 'Autre.');
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

	test('should count every row of the user, past the retention too, and no other', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		await TranscriptFactory.merge({ userId: user.id }).createMany(2);
		await TranscriptFactory.merge({
			userId: user.id,
			createdAt: daysAgo(RETENTION_DAYS + 1),
		}).create();
		await TranscriptFactory.with('user').create();

		assert.equal(await service.count(user.id), 3);
	});

	test('should count zero when the user has no row', async ({ assert }) => {
		const { service, user } = await createService();

		assert.equal(await service.count(user.id), 0);
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

	test('should store the cleaned text of a row without one', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			rawText: 'euh bonjour',
			cleanedText: null,
		}).create();

		await service.clean(user.id, transcript.id);

		await transcript.refresh();
		assert.equal(transcript.cleanedText, 'EUH BONJOUR');
	});

	test('should not call the cleaner when the row is already cleaned', async ({
		assert,
	}) => {
		const { service, user, textCleaner } = await createService();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: 'Déjà propre.',
		}).create();

		await service.clean(user.id, transcript.id);

		await transcript.refresh();
		assert.equal(transcript.cleanedText, 'Déjà propre.');
		assert.lengthOf(textCleaner.cleaned, 0);
	});

	test('should throw not found without cleaning when the row belongs to another user', async ({
		assert,
	}) => {
		const { service, user, textCleaner } = await createService();
		const foreign = await TranscriptFactory.with('user')
			.merge({ cleanedText: null })
			.create();

		await assert.rejects(
			() => service.clean(user.id, foreign.id),
			'Dictée introuvable'
		);
		assert.lengthOf(textCleaner.cleaned, 0);
	});

	test('should throw not found when the row is past the retention', async ({
		assert,
	}) => {
		const { service, user } = await createService();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: null,
			createdAt: daysAgo(RETENTION_DAYS + 1),
		}).create();

		await assert.rejects(
			() => service.clean(user.id, transcript.id),
			'Dictée introuvable'
		);
	});

	test('should keep the row uncleaned and rethrow when the cleanup is unavailable', async ({
		assert,
	}) => {
		const { service, user } = await createService(
			new FakeTextCleaner(new TextCleanupUnavailableException())
		);
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			cleanedText: null,
		}).create();

		await assert.rejects(
			() => service.clean(user.id, transcript.id),
			'Le nettoyage du texte est indisponible'
		);
		await transcript.refresh();
		assert.isNull(transcript.cleanedText);
	});
});
