import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import { UserFactory } from '#database/factories/user_factory';
import { DictationQuotaService } from '#dictation_quota/dictation_quota_service';
import { FixedClock } from '#tests/helpers/fixed_clock';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';

const SECONDS_PER_MINUTE = 60;
const QUOTA_BYTES = 60 * SECONDS_PER_MINUTE * PCM_AUDIO_FORMAT.bytesPerSecond;
const ONE_MINUTE_BYTES = SECONDS_PER_MINUTE * PCM_AUDIO_FORMAT.bytesPerSecond;

const utc = (iso: string): DateTime => DateTime.fromISO(iso, { zone: 'utc' });

async function createService(instant: string) {
	const clock = new FixedClock(utc(instant));
	const user = await UserFactory.create();
	return { clock, user, service: new DictationQuotaService(clock) };
}

test.group('DictationQuotaService', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should report the whole quota as remaining when nothing was recorded', async ({
		assert,
	}) => {
		const { service, user } = await createService('2026-03-10T10:00:00Z');

		const usage = await service.getUsage(user.id);

		assert.deepEqual(usage, { usedBytes: 0, remainingBytes: QUOTA_BYTES });
	});

	test('should create the day usage then accumulate the next recordings', async ({
		assert,
	}) => {
		const { service, user } = await createService('2026-03-10T10:00:00Z');

		await service.record(user.id, 1000);
		await service.record(user.id, 2500);

		const usage = await service.getUsage(user.id);
		assert.equal(usage.usedBytes, 3500);
		assert.equal(usage.remainingBytes, QUOTA_BYTES - 3500);
	});

	test('should keep the usage of each user apart', async ({ assert }) => {
		const { service, user } = await createService('2026-03-10T10:00:00Z');
		const otherUser = await UserFactory.create();

		await service.record(user.id, 1000);

		assert.equal((await service.getUsage(otherUser.id)).usedBytes, 0);
	});

	test('should count a new day from zero', async ({ assert }) => {
		const { service, user, clock } = await createService(
			'2026-03-10T10:00:00Z'
		);
		await service.record(user.id, 1000);

		clock.moveTo(utc('2026-03-11T10:00:00Z'));

		assert.equal((await service.getUsage(user.id)).usedBytes, 0);
		await service.record(user.id, 400);
		assert.equal((await service.getUsage(user.id)).usedBytes, 400);
		clock.moveTo(utc('2026-03-10T10:00:00Z'));
		assert.equal((await service.getUsage(user.id)).usedBytes, 1000);
	});

	test('should switch day at midnight in Paris, not at midnight UTC', async ({
		assert,
	}) => {
		const { service, user, clock } = await createService(
			'2026-01-14T22:59:00Z'
		);
		await service.record(user.id, 1000);

		clock.moveTo(utc('2026-01-14T23:01:00Z'));

		assert.equal((await service.getUsage(user.id)).usedBytes, 0);
	});

	test('should follow the summer offset of Paris for the day boundary', async ({
		assert,
	}) => {
		const { service, user, clock } = await createService(
			'2026-06-14T21:59:00Z'
		);
		await service.record(user.id, 1000);

		clock.moveTo(utc('2026-06-14T22:01:00Z'));

		assert.equal((await service.getUsage(user.id)).usedBytes, 0);
	});

	test('should never report a negative remaining budget once the quota is exceeded', async ({
		assert,
	}) => {
		const { service, user } = await createService('2026-03-10T10:00:00Z');

		await service.record(user.id, QUOTA_BYTES + 5000);

		const usage = await service.getUsage(user.id);
		assert.equal(usage.remainingBytes, 0);
		assert.equal(usage.usedBytes, QUOTA_BYTES + 5000);
		assert.equal(await service.getRemainingMinutes(user.id), 0);
	});

	test('should round the remaining minutes up', async ({ assert }) => {
		const { service, user } = await createService('2026-03-10T10:00:00Z');

		await service.record(user.id, 18 * ONE_MINUTE_BYTES + 1);

		assert.equal(await service.getRemainingMinutes(user.id), 42);
	});
});
