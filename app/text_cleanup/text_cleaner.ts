import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';

/**
 * Port to a text cleanup engine. An abstract class so it can serve as the
 * container token (types do not exist at runtime); the single adapter lives
 * in `anthropic/`, and the rest of the app only knows this port.
 */
export abstract class TextCleaner {
	/** Resolves to the cleaned text or throws `TextCleanupUnavailableException`. */
	abstract clean(
		text: string,
		preferences: Readonly<CleanupPreferences>
	): Promise<string>;
}
