import { inject } from '@adonisjs/core';

import dictationConfig from '#config/dictation';
import type { DictationQuotaUsage } from '#dictation_quota/dictation_quota_usage';
import DictationUsage from '#dictation_quota/dictation_usage';
import { Clock } from '#shared/clock';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';

const SECONDS_PER_MINUTE = 60;
const DAY_FORMAT = 'yyyy-MM-dd';
const DAILY_QUOTA_BYTES =
	dictationConfig.dailyQuotaMinutes *
	SECONDS_PER_MINUTE *
	PCM_AUDIO_FORMAT.bytesPerSecond;

@inject()
export class DictationQuotaService {
	constructor(private readonly clock: Clock) {}

	/** @returns Today's usage; the remaining bytes are never negative. */
	async getUsage(userId: number): Promise<DictationQuotaUsage> {
		const usedBytes = await DictationUsage.findReceivedBytes(
			userId,
			this.#today()
		);
		return {
			usedBytes,
			remainingBytes: Math.max(0, DAILY_QUOTA_BYTES - usedBytes),
		};
	}

	async getRemainingMinutes(userId: number): Promise<number> {
		const { remainingBytes } = await this.getUsage(userId);
		return Math.ceil(
			remainingBytes / PCM_AUDIO_FORMAT.bytesPerSecond / SECONDS_PER_MINUTE
		);
	}

	async record(userId: number, receivedBytes: number): Promise<void> {
		await DictationUsage.addReceivedBytes(userId, this.#today(), receivedBytes);
	}

	#today(): string {
		return this.clock
			.now()
			.setZone(dictationConfig.quotaTimezone)
			.toFormat(DAY_FORMAT);
	}
}
