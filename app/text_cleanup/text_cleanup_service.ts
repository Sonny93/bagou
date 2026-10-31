import { inject } from '@adonisjs/core';
import { Logger } from '@adonisjs/core/logger';

import { describeErrorForLog } from '#dictation/describe_error_for_log';
import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';
import { TextCleaner } from '#text_cleanup/text_cleaner';

const MAX_REPORTED_RATIO = 0.95;
const PROGRESS_STEP_PERCENT = 1;
const PERCENT = 100;

type CleanOptions = {
	onProgress?: (percent: number) => void;
};

@inject()
export class TextCleanupService {
	constructor(
		private readonly textCleaner: TextCleaner,
		private readonly logger: Logger
	) {}

	/**
	 * Cleans a raw transcript; an empty one is returned as-is without any call.
	 * `onProgress` receives an approximate percent, in steps of 1, rising only,
	 * never above 95: the caller reports completion itself.
	 */
	async clean(
		text: string,
		preferences: Readonly<CleanupPreferences>,
		options?: Readonly<CleanOptions>
	): Promise<string> {
		if (text.trim() === '') return '';
		if (!options?.onProgress) return this.textCleaner.clean(text, preferences);
		return this.textCleaner.clean(text, preferences, {
			onOutputLength: this.#createProgressReporter(
				text.length,
				options.onProgress
			),
		});
	}

	#createProgressReporter(
		inputLength: number,
		onProgress: (percent: number) => void
	): (outputLength: number) => void {
		let lastPercent = -1;
		return (outputLength) => {
			const ratio = Math.min(outputLength / inputLength, MAX_REPORTED_RATIO);
			const percent =
				Math.floor((ratio * PERCENT) / PROGRESS_STEP_PERCENT) *
				PROGRESS_STEP_PERCENT;
			if (percent <= lastPercent) return;
			lastPercent = percent;
			this.#report(onProgress, percent);
		};
	}

	#report(onProgress: (percent: number) => void, percent: number): void {
		try {
			onProgress(percent);
		} catch (error) {
			this.logger.warn(
				describeErrorForLog(error),
				'Cleanup progress could not be reported'
			);
		}
	}
}
