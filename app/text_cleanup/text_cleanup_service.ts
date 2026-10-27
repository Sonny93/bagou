import { inject } from '@adonisjs/core';

import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';
import { TextCleaner } from '#text_cleanup/text_cleaner';

@inject()
export class TextCleanupService {
	constructor(private readonly textCleaner: TextCleaner) {}

	/** Cleans a raw transcript; an empty one is returned as-is without any call. */
	async clean(
		text: string,
		preferences: Readonly<CleanupPreferences>
	): Promise<string> {
		if (text.trim() === '') return '';
		return this.textCleaner.clean(text, preferences);
	}
}
