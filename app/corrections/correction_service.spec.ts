import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import userSettingsConfig from '#config/user_settings';
import CorrectionSuggestion from '#correction_suggestions/correction_suggestion';
import Correction from '#corrections/correction';
import { CorrectionService } from '#corrections/correction_service';
import CorrectionsFullException from '#corrections/corrections_full_exception';
import CorrectionsStorageException from '#corrections/corrections_storage_exception';
import { CorrectionFactory } from '#database/factories/correction_factory';
import { CorrectionSuggestionFactory } from '#database/factories/correction_suggestion_factory';
import { UserFactory } from '#database/factories/user_factory';
import { createCorrectionService } from '#tests/helpers/create_correction_service';
import { createRecordingLogger } from '#tests/helpers/create_recording_logger';

async function fillToCap(userId: number): Promise<void> {
	const rows = Array.from(
		{ length: userSettingsConfig.maxCorrections },
		(_, index) => ({
			userId,
			heard: `heard ${index}`,
			written: `written ${index}`,
		})
	);
	await Correction.createMany(rows);
}

test.group('CorrectionService', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should add a pair and return it', async ({ assert }) => {
		const user = await UserFactory.create();

		const correction = await createCorrectionService().add(user.id, {
			heard: 'cloud',
			written: 'Claude',
		});

		assert.equal(correction.heard, 'cloud');
		assert.equal(correction.written, 'Claude');
		assert.equal(correction.userId, user.id);
	});

	test('should keep one row and refresh the casing and the order when the pair is added again', async ({
		assert,
	}) => {
		const service = createCorrectionService();
		const user = await UserFactory.create();
		const first = await service.add(user.id, {
			heard: 'chatgpt',
			written: 'chatgpt',
		});
		await service.add(user.id, { heard: 'cloud', written: 'Claude' });

		const refreshed = await service.add(user.id, {
			heard: 'ChatGPT',
			written: 'ChatGPT',
		});

		assert.equal(refreshed.id, first.id);
		assert.deepEqual(await service.listPairs(user.id), [
			{ heard: 'ChatGPT', written: 'ChatGPT' },
			{ heard: 'cloud', written: 'Claude' },
		]);
	});

	test('should keep several written words for the same heard word', async ({
		assert,
	}) => {
		const service = createCorrectionService();
		const user = await UserFactory.create();

		await service.add(user.id, { heard: 'cloud', written: 'Claude' });
		await service.add(user.id, { heard: 'cloud', written: 'Clode' });

		assert.deepEqual(await service.listPairs(user.id), [
			{ heard: 'cloud', written: 'Clode' },
			{ heard: 'cloud', written: 'Claude' },
		]);
	});

	test('should list only the pairs of the user, newest first', async ({
		assert,
	}) => {
		const service = createCorrectionService();
		const user = await UserFactory.create();
		const other = await UserFactory.create();
		await CorrectionFactory.merge({ userId: other.id }).create();
		await service.add(user.id, { heard: 'a', written: 'A' });
		await service.add(user.id, { heard: 'b', written: 'B' });

		const corrections = await service.list(user.id);

		assert.deepEqual(
			corrections.map(({ heard }) => heard),
			['b', 'a']
		);
	});

	test('should refuse a new pair once the user reached the cap', async ({
		assert,
	}) => {
		const service = createCorrectionService();
		const user = await UserFactory.create();
		await fillToCap(user.id);

		await assert.rejects(
			() => service.add(user.id, { heard: 'cloud', written: 'Claude' }),
			CorrectionsFullException
		);
		assert.equal(
			await Correction.countOwned(user.id),
			userSettingsConfig.maxCorrections
		);
	});

	test('should never list more pairs than the cap', async ({ assert }) => {
		const service = createCorrectionService();
		const user = await UserFactory.create();
		await fillToCap(user.id);
		await CorrectionFactory.merge({ userId: user.id }).create();

		assert.lengthOf(
			await service.list(user.id),
			userSettingsConfig.maxCorrections
		);
	});

	test('should still refresh an existing pair at the cap', async ({
		assert,
	}) => {
		const service = createCorrectionService();
		const user = await UserFactory.create();
		await fillToCap(user.id);

		const refreshed = await service.add(user.id, {
			heard: 'HEARD 0',
			written: 'Written 0',
		});

		assert.equal(refreshed.heard, 'HEARD 0');
		assert.equal(
			await Correction.countOwned(user.id),
			userSettingsConfig.maxCorrections
		);
	});

	test('should not count the pairs of other users toward the cap', async ({
		assert,
	}) => {
		const service = createCorrectionService();
		const user = await UserFactory.create();
		const other = await UserFactory.create();
		await fillToCap(other.id);

		const correction = await service.add(user.id, {
			heard: 'cloud',
			written: 'Claude',
		});

		assert.equal(correction.userId, user.id);
	});

	test('should delete a pair of the owner, and do nothing when it is already gone', async ({
		assert,
	}) => {
		const service = createCorrectionService();
		const user = await UserFactory.create();
		const correction = await CorrectionFactory.merge({
			userId: user.id,
		}).create();

		await service.remove(user.id, correction.id);
		await service.remove(user.id, correction.id);

		assert.lengthOf(await service.list(user.id), 0);
	});

	test('should not delete the pair of another user', async ({ assert }) => {
		const service = createCorrectionService();
		const owner = await UserFactory.create();
		const stranger = await UserFactory.create();
		const correction = await CorrectionFactory.merge({
			userId: owner.id,
		}).create();

		await service.remove(stranger.id, correction.id);

		assert.lengthOf(await service.list(owner.id), 1);
	});

	test('should count the corrected words beyond the speech recognition cap', ({
		assert,
	}) => {
		const service = createCorrectionService();
		const vocabulary = Array.from(
			{ length: userSettingsConfig.maxVocabularyTerms - 1 },
			(_, index) => `term ${index}`
		);
		const corrections = [
			{ heard: 'a', written: 'Alpha' },
			{ heard: 'b', written: 'alpha' },
			{ heard: 'c', written: 'Bravo' },
			{ heard: 'd', written: 'Charlie' },
		];

		assert.equal(service.countBeyondSpeechLimit(vocabulary, corrections), 2);
		assert.equal(service.countBeyondSpeechLimit([], corrections), 0);
	});

	test('should throw a storage error and log neither the pair nor the driver detail when the database refuses the write', async ({
		assert,
	}) => {
		const { logger, lines } = createRecordingLogger();
		const service = new CorrectionService(logger);
		const unknownUserId = 999_999;

		await assert.rejects(
			() =>
				service.add(unknownUserId, {
					heard: 'secret heard',
					written: 'secret written',
				}),
			CorrectionsStorageException
		);

		const logged = lines.join('\n');
		assert.include(logged, 'Corrections could not be written');
		assert.include(logged, '"errorCode":"23503"');
		assert.notInclude(logged, 'secret');
		assert.notInclude(logged, String(unknownUserId));
	});
});

/**
 * No global transaction here: it would put every call on one connection, where
 * the advisory lock is re-entrant and nothing runs concurrently. Rows are
 * committed, so the user (and its corrections, by cascade) is deleted after.
 */
test.group('CorrectionService concurrency', () => {
	test('should never exceed the cap when many pairs are added at once', async ({
		assert,
		cleanup,
	}) => {
		const service = createCorrectionService();
		const user = await UserFactory.create();
		cleanup(() => user.delete());
		const concurrentAdds = 50;
		await Correction.createMany(
			Array.from(
				{ length: userSettingsConfig.maxCorrections - 1 },
				(_, index) => ({
					userId: user.id,
					heard: `heard ${index}`,
					written: `written ${index}`,
				})
			)
		);

		const outcomes = await Promise.allSettled(
			Array.from({ length: concurrentAdds }, (_, index) =>
				service.add(user.id, { heard: `new ${index}`, written: `New ${index}` })
			)
		);

		const rejections = outcomes.filter(
			(outcome): outcome is PromiseRejectedResult =>
				outcome.status === 'rejected'
		);
		assert.equal(
			await Correction.countOwned(user.id),
			userSettingsConfig.maxCorrections
		);
		assert.lengthOf(rejections, concurrentAdds - 1);
		for (const rejection of rejections) {
			assert.instanceOf(rejection.reason, CorrectionsFullException);
		}
	});
});

test.group('CorrectionService suggestions', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should remove the pending suggestion of the pair, whatever its case, when it is remembered', async ({
		assert,
	}) => {
		const user = await UserFactory.create();
		const other = await UserFactory.create();
		await CorrectionSuggestionFactory.merge({
			userId: user.id,
			heard: 'Vox Tral',
			written: 'Voxtral',
		}).create();
		await CorrectionSuggestionFactory.merge({
			userId: other.id,
			heard: 'Vox Tral',
			written: 'Voxtral',
		}).create();

		await createCorrectionService().add(user.id, {
			heard: 'vox tral',
			written: 'voxtral',
		});

		assert.lengthOf(
			await CorrectionSuggestion.query().where('userId', user.id),
			0
		);
		assert.lengthOf(
			await CorrectionSuggestion.query().where('userId', other.id),
			1
		);
	});

	test('should keep the pending suggestion when the user reached the cap', async ({
		assert,
	}) => {
		const user = await UserFactory.create();
		await fillToCap(user.id);
		await CorrectionSuggestionFactory.merge({
			userId: user.id,
			heard: 'cloud',
			written: 'Claude',
		}).create();

		await assert.rejects(
			() =>
				createCorrectionService().add(user.id, {
					heard: 'cloud',
					written: 'Claude',
				}),
			CorrectionsFullException
		);

		assert.lengthOf(
			await CorrectionSuggestion.query().where('userId', user.id),
			1
		);
	});
});
