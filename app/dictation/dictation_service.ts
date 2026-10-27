import { inject } from '@adonisjs/core';
import { Logger } from '@adonisjs/core/logger';

import { Dictation } from '#dictation/dictation';
import { DictationCompletionService } from '#dictation/dictation_completion_service';
import type { DictationListener } from '#dictation/dictation_listener';
import DictationQuotaExceededException from '#dictation/dictation_quota_exceeded_exception';
import type { DictationRawKeeper } from '#dictation/dictation_raw_keeper';
import { DictationStartLimiter } from '#dictation/dictation_start_limiter';
import type { DraftContext } from '#dictation/draft_context';
import { DictationQuotaService } from '#dictation_quota/dictation_quota_service';
import { PCM_AUDIO_FORMAT } from '#transcription/pcm_audio_format';
import { TranscriptionProvider } from '#transcription/transcription_provider';
import type { PreviewSettings } from '#user_settings/preview_settings';
import { toCleanupPreferences } from '#user_settings/to_cleanup_preferences';
import { UserSettingsService } from '#user_settings/user_settings_service';

const keepNothing: DictationRawKeeper = async () => undefined;

@inject()
export class DictationService {
	constructor(
		private readonly provider: TranscriptionProvider,
		private readonly logger: Logger,
		private readonly quotaService: DictationQuotaService,
		private readonly startLimiter: DictationStartLimiter,
		private readonly completionService: DictationCompletionService,
		private readonly userSettingsService: UserSettingsService
	) {}

	/**
	 * Refuses a user who started too many dictations or spent today's quota,
	 * before any provider session is opened. The completion and the raw
	 * keeping of the dictation are bound to the draft it is dictated into. The
	 * user's settings are read once: language and vocabulary for the provider
	 * session, preferences for the cleanup.
	 */
	async create(
		userId: number,
		draft: Readonly<DraftContext>,
		listener: DictationListener
	): Promise<Dictation> {
		const { remainingBytes, userLogger } = await this.#admit(userId);
		const settings = await this.userSettingsService.get(userId);
		const preferences = toCleanupPreferences(settings);
		return new Dictation(this.provider, userLogger, listener, {
			language: settings.dictationLanguage,
			vocabulary: settings.vocabulary,
			remainingBytes,
			recordUsage: (receivedBytes) =>
				this.quotaService.record(userId, receivedBytes),
			complete: (rawText) =>
				this.completionService.complete(userId, draft, rawText, preferences),
			keepRaw: (rawText) =>
				this.completionService.keepRaw(userId, draft.draftId, rawText),
		});
	}

	/**
	 * Same limiter and quota as a regular dictation, but language, vocabulary
	 * and preferences come from the given settings, which are never read from
	 * nor written to the database. Completion cleans the raw segment alone and
	 * a cancelled preview keeps nothing; the audio still counts in the quota.
	 */
	async createPreview(
		userId: number,
		settings: Readonly<PreviewSettings>,
		listener: DictationListener
	): Promise<Dictation> {
		const { remainingBytes, userLogger } = await this.#admit(userId);
		const preferences = toCleanupPreferences(settings);
		return new Dictation(this.provider, userLogger, listener, {
			language: settings.dictationLanguage,
			vocabulary: settings.vocabulary,
			remainingBytes,
			recordUsage: (receivedBytes) =>
				this.quotaService.record(userId, receivedBytes),
			complete: (rawText) =>
				this.completionService.completePreview(rawText, preferences),
			keepRaw: keepNothing,
		});
	}

	async #admit(
		userId: number
	): Promise<{ remainingBytes: number; userLogger: Logger }> {
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
		return { remainingBytes, userLogger };
	}
}
