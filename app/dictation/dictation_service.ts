import { inject } from '@adonisjs/core';
import { Logger } from '@adonisjs/core/logger';

import { Dictation } from '#dictation/dictation';
import type { DictationListener } from '#dictation/dictation_listener';
import DictationQuotaExceededException from '#dictation/dictation_quota_exceeded_exception';
import { DictationStartLimiter } from '#dictation/dictation_start_limiter';
import { DictationQuotaService } from '#dictation_quota/dictation_quota_service';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import { TranscriptionProvider } from '#transcription/transcription_provider';

@inject()
export class DictationService {
	constructor(
		private readonly provider: TranscriptionProvider,
		private readonly logger: Logger,
		private readonly quotaService: DictationQuotaService,
		private readonly startLimiter: DictationStartLimiter
	) {}

	/**
	 * Refuses a user who started too many dictations or spent today's quota,
	 * before any provider session is opened.
	 */
	async create(
		userId: number,
		listener: DictationListener
	): Promise<Dictation> {
		await this.startLimiter.consume(userId);
		const { usedBytes, remainingBytes } =
			await this.quotaService.getUsage(userId);
		const userLogger = this.logger.child({ userId });
		if (remainingBytes === 0) {
			userLogger.warn(
				{ usedSeconds: usedBytes / PCM_AUDIO_FORMAT.bytesPerSecond },
				'Daily dictation quota already reached'
			);
			throw new DictationQuotaExceededException();
		}
		return new Dictation(this.provider, userLogger, listener, {
			remainingBytes,
			recordUsage: (receivedBytes) =>
				this.quotaService.record(userId, receivedBytes),
		});
	}
}
