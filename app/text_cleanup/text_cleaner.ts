import type { CleanupPreferences } from '#text_cleanup/cleanup_preferences';

export type TextCleanOptions = {
	/**
	 * Called while the engine produces its answer, with the number of
	 * characters of output received so far. An approximation: it may include
	 * the engine's own framing and never carries the text itself.
	 */
	onOutputLength?: (characters: number) => void;
};

/**
 * Port to a text cleanup engine. An abstract class so it can serve as the
 * container token (types do not exist at runtime); the single adapter lives
 * in `anthropic/`, and the rest of the app only knows this port.
 */
export abstract class TextCleaner {
	/** Resolves to the cleaned text or throws `TextCleanupUnavailableException`. */
	abstract clean(
		text: string,
		preferences: Readonly<CleanupPreferences>,
		options?: Readonly<TextCleanOptions>
	): Promise<string>;
}
