import app from '@adonisjs/core/services/app';

import type { FakeTextCleaner } from '#tests/helpers/fake_text_cleaner';
import { TextCleaner } from '#text_cleanup/text_cleaner';

/**
 * Replaces the text cleanup port for one test and returns the function that
 * restores the real binding, meant for the test's `cleanup`.
 */
export function swapTextCleaner(textCleaner: FakeTextCleaner): () => void {
	app.container.swap(TextCleaner, () => textCleaner);
	return () => app.container.restore(TextCleaner);
}
