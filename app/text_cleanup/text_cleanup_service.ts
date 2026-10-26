import { inject } from '@adonisjs/core';

import { TextCleaner } from '#text_cleanup/text_cleaner';

@inject()
export class TextCleanupService {
	constructor(private readonly textCleaner: TextCleaner) {}

	/** Cleans a raw transcript; an empty one is returned as-is without any call. */
	async clean(text: string): Promise<string> {
		if (text.trim() === '') return '';
		return this.textCleaner.clean(text);
	}
}
