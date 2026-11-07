import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import correctionSuggestionsConfig from '#config/correction_suggestions';
import transcriptionHistoryConfig from '#config/transcription_history';
import CorrectionSuggestion, {
	CORRECTION_SUGGESTION_STATUS,
} from '#correction_suggestions/correction_suggestion';
import { CorrectionSuggestionService } from '#correction_suggestions/correction_suggestion_service';
import CorrectionSuggestionsStorageException from '#correction_suggestions/correction_suggestions_storage_exception';
import { CorrectionFactory } from '#database/factories/correction_factory';
import { CorrectionSuggestionFactory } from '#database/factories/correction_suggestion_factory';
import { TranscriptFactory } from '#database/factories/transcript_factory';
import { UserFactory } from '#database/factories/user_factory';
import { createCorrectionSuggestionService } from '#tests/helpers/create_correction_suggestion_service';
import { createRecordingLogger } from '#tests/helpers/create_recording_logger';
import { FixedClock } from '#tests/helpers/fixed_clock';
import Transcript from '#transcription_history/transcript';

const DRAFT_ID = '3f1c2b64-5a0e-4a53-8d62-0c6f6d1d8a11';
const OTHER_DRAFT_ID = '9b2d7f10-1c4e-4f6a-a0b1-2d3e4f5a6b7c';
const CLOUD_PAIR = { heard: 'Vox Tral', written: 'Voxtral' };

test.group('CorrectionSuggestionService', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should store the pairs as pending and link the transcript of the draft', async ({
		assert,
	}) => {
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			draftId: DRAFT_ID,
		}).create();

		const pending = await createCorrectionSuggestionService().push(
			user.id,
			DRAFT_ID,
			[CLOUD_PAIR]
		);

		assert.lengthOf(pending, 1);
		assert.equal(pending[0]?.heard, 'Vox Tral');
		assert.equal(pending[0]?.transcriptId, transcript.id);
	});

	test('should store a pending suggestion without transcript when the draft has no entry', async ({
		assert,
	}) => {
		const user = await UserFactory.create();

		const pending = await createCorrectionSuggestionService().push(
			user.id,
			DRAFT_ID,
			[CLOUD_PAIR]
		);

		assert.isNull(pending[0]?.transcriptId);
	});

	test('should never link the transcript of another user', async ({
		assert,
	}) => {
		const user = await UserFactory.create();
		const other = await UserFactory.create();
		await TranscriptFactory.merge({
			userId: other.id,
			draftId: DRAFT_ID,
		}).create();

		const pending = await createCorrectionSuggestionService().push(
			user.id,
			DRAFT_ID,
			[CLOUD_PAIR]
		);

		assert.isNull(pending[0]?.transcriptId);
	});

	test('should ignore the pairs the user already remembers, whatever the case', async ({
		assert,
	}) => {
		const user = await UserFactory.create();
		await CorrectionFactory.merge({
			userId: user.id,
			heard: 'vox tral',
			written: 'VOXTRAL',
		}).create();

		const pending = await createCorrectionSuggestionService().push(
			user.id,
			DRAFT_ID,
			[CLOUD_PAIR]
		);

		assert.lengthOf(pending, 0);
		assert.lengthOf(await CorrectionSuggestion.all(), 0);
	});

	test('should keep one row and its transcript when the pair is pushed again from a draft without entry', async ({
		assert,
	}) => {
		const service = createCorrectionSuggestionService();
		const user = await UserFactory.create();
		const transcript = await TranscriptFactory.merge({
			userId: user.id,
			draftId: DRAFT_ID,
		}).create();
		await service.push(user.id, DRAFT_ID, [CLOUD_PAIR]);

		const pending = await service.push(user.id, OTHER_DRAFT_ID, [
			{ heard: 'vox tral', written: 'voxtral' },
		]);

		assert.lengthOf(pending, 1);
		assert.equal(pending[0]?.transcriptId, transcript.id);
	});

	test('should never turn a dismissed pair back to pending when it is pushed again', async ({
		assert,
	}) => {
		const service = createCorrectionSuggestionService();
		const user = await UserFactory.create();
		await service.dismiss(user.id, [CLOUD_PAIR]);

		const pending = await service.push(user.id, DRAFT_ID, [
			{ heard: 'VOX TRAL', written: 'voxtral' },
		]);

		assert.lengthOf(pending, 0);
		assert.deepEqual(await service.listDismissedPairs(user.id), [CLOUD_PAIR]);
	});

	test('should dismiss a pending pair and drop its transcript link', async ({
		assert,
	}) => {
		const service = createCorrectionSuggestionService();
		const user = await UserFactory.create();
		await TranscriptFactory.merge({
			userId: user.id,
			draftId: DRAFT_ID,
		}).create();
		await service.push(user.id, DRAFT_ID, [CLOUD_PAIR]);

		await service.dismiss(user.id, [CLOUD_PAIR]);

		assert.lengthOf(await service.listPending(user.id), 0);
		const [dismissed] = await CorrectionSuggestion.query().where(
			'userId',
			user.id
		);
		assert.equal(dismissed?.status, CORRECTION_SUGGESTION_STATUS.dismissed);
		assert.isNull(dismissed?.transcriptId);
	});

	test('should purge the pending suggestions older than the retention when pushing', async ({
		assert,
	}) => {
		const now = DateTime.fromISO('2026-06-01T12:00:00Z');
		const service = createCorrectionSuggestionService(new FixedClock(now));
		const user = await UserFactory.create();
		const stale = await CorrectionSuggestionFactory.merge({
			userId: user.id,
		}).create();
		const dismissedStale = await CorrectionSuggestionFactory.merge({
			userId: user.id,
			status: CORRECTION_SUGGESTION_STATUS.dismissed,
		}).create();
		const staleInstant = now.minus({
			days: transcriptionHistoryConfig.retentionDays + 1,
		});
		await CorrectionSuggestion.query()
			.whereIn('id', [stale.id, dismissedStale.id])
			.update({ updatedAt: staleInstant.toSQL() });

		await service.push(user.id, DRAFT_ID, [CLOUD_PAIR]);

		const remainingIds = (
			await CorrectionSuggestion.query().where('userId', user.id)
		).map(({ id }) => id);
		assert.notInclude(remainingIds, stale.id);
		assert.include(remainingIds, dismissedStale.id);
	});

	test('should not list a pending suggestion older than the retention', async ({
		assert,
	}) => {
		const now = DateTime.fromISO('2026-06-01T12:00:00Z');
		const service = createCorrectionSuggestionService(new FixedClock(now));
		const user = await UserFactory.create();
		const stale = await CorrectionSuggestionFactory.merge({
			userId: user.id,
		}).create();
		await CorrectionSuggestion.query()
			.where('id', stale.id)
			.update({
				updatedAt: now
					.minus({ days: transcriptionHistoryConfig.retentionDays + 1 })
					.toSQL(),
			});

		assert.lengthOf(await service.listPending(user.id), 0);
	});

	test('should keep only the newest pending suggestions beyond the cap', async ({
		assert,
	}) => {
		const service = createCorrectionSuggestionService();
		const user = await UserFactory.create();
		const cap = correctionSuggestionsConfig.maxPendingSuggestions;
		await CorrectionSuggestionFactory.merge({ userId: user.id }).createMany(
			cap
		);
		const oldest = await CorrectionSuggestion.query()
			.where('userId', user.id)
			.orderBy('id', 'asc')
			.firstOrFail();

		const pending = await service.push(user.id, DRAFT_ID, [CLOUD_PAIR]);

		assert.lengthOf(pending, cap);
		assert.equal(pending[0]?.heard, 'Vox Tral');
		assert.notInclude(
			pending.map(({ id }) => id),
			oldest.id
		);
	});

	test('should keep only the newest dismissed suggestions beyond the cap', async ({
		assert,
	}) => {
		const service = createCorrectionSuggestionService();
		const user = await UserFactory.create();
		const cap = correctionSuggestionsConfig.maxDismissedSuggestions;
		await CorrectionSuggestionFactory.merge({
			userId: user.id,
			status: CORRECTION_SUGGESTION_STATUS.dismissed,
		}).createMany(cap);

		await service.dismiss(user.id, [CLOUD_PAIR]);

		const dismissed = await service.listDismissedPairs(user.id);
		assert.lengthOf(dismissed, cap);
		assert.deepEqual(dismissed[0], CLOUD_PAIR);
	});

	test('should not list a pending suggestion the user remembers meanwhile', async ({
		assert,
	}) => {
		const service = createCorrectionSuggestionService();
		const user = await UserFactory.create();
		await service.push(user.id, DRAFT_ID, [CLOUD_PAIR]);
		await CorrectionFactory.merge({
			userId: user.id,
			heard: 'VOX TRAL',
			written: 'voxtral',
		}).create();

		assert.lengthOf(await service.listPending(user.id), 0);
	});

	test('should list only the pending suggestions of the user, newest first', async ({
		assert,
	}) => {
		const service = createCorrectionSuggestionService();
		const user = await UserFactory.create();
		const other = await UserFactory.create();
		await service.push(other.id, DRAFT_ID, [CLOUD_PAIR]);
		await service.push(user.id, DRAFT_ID, [
			{ heard: 'a', written: 'A' },
			{ heard: 'b', written: 'B' },
		]);

		const pending = await service.listPending(user.id);

		assert.deepEqual(
			pending.map(({ heard }) => heard),
			['b', 'a']
		);
	});

	test('should delete a pending suggestion with its transcript and keep a dismissed one', async ({
		assert,
	}) => {
		const service = createCorrectionSuggestionService();
		const user = await UserFactory.create();
		await TranscriptFactory.merge({
			userId: user.id,
			draftId: DRAFT_ID,
		}).create();
		await service.push(user.id, DRAFT_ID, [CLOUD_PAIR]);
		await service.dismiss(user.id, [{ heard: 'cloud', written: 'Claude' }]);

		await Transcript.deleteAllOwned(user.id);

		assert.lengthOf(await service.listPending(user.id), 0);
		assert.deepEqual(await service.listDismissedPairs(user.id), [
			{ heard: 'cloud', written: 'Claude' },
		]);
	});

	test('should throw a storage exception and log neither the pair nor the error detail when the write fails', async ({
		assert,
	}) => {
		const { logger, lines } = createRecordingLogger();
		const service = new CorrectionSuggestionService(logger, createClock());
		const user = await UserFactory.create();
		const tooLong = 'x'.repeat(300);

		await assert.rejects(
			() => service.dismiss(user.id, [{ heard: tooLong, written: 'secret' }]),
			CorrectionSuggestionsStorageException
		);
		assert.lengthOf(lines, 1);
		assert.notMatch(lines[0] ?? '', /secret|xxxx/);
	});
});

function createClock(): FixedClock {
	return new FixedClock(DateTime.fromISO('2026-06-01T12:00:00Z'));
}
