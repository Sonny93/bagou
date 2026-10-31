import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';
import { TextCleaner } from '#text_cleanup/text_cleaner';
import type { TextCleanOptions } from '#text_cleanup/text_cleaner';

/**
 * Upper-cases the text, or fails when given an error. Reports the given
 * output lengths before answering, as an engine streaming its output would.
 */
export class FakeTextCleaner extends TextCleaner {
	readonly cleaned: string[] = [];
	readonly receivedPreferences: CleanupPreferences[] = [];

	constructor(
		private readonly failure?: Error,
		private readonly outputLengths: readonly number[] = []
	) {
		super();
	}

	async clean(
		text: string,
		preferences: Readonly<CleanupPreferences>,
		options?: Readonly<TextCleanOptions>
	): Promise<string> {
		this.cleaned.push(text);
		this.receivedPreferences.push(preferences);
		for (const length of this.outputLengths) options?.onOutputLength?.(length);
		if (this.failure) throw this.failure;
		return text.toUpperCase();
	}
}
