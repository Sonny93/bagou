import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';
import { TextCleaner } from '#text_cleanup/text_cleaner';

/** Upper-cases the text, or fails when given an error. */
export class FakeTextCleaner extends TextCleaner {
	readonly cleaned: string[] = [];
	readonly receivedPreferences: CleanupPreferences[] = [];

	constructor(private readonly failure?: Error) {
		super();
	}

	async clean(
		text: string,
		preferences: Readonly<CleanupPreferences>
	): Promise<string> {
		this.cleaned.push(text);
		this.receivedPreferences.push(preferences);
		if (this.failure) throw this.failure;
		return text.toUpperCase();
	}
}
