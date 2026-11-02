import type { CleanupSnapshot } from '~/dictation/show_dictation/cleanup_snapshot';

/**
 * The text a cleanup starts from. Right after a re-clean of the same draft,
 * with the cleaned text untouched, it is the original input of that re-clean,
 * so models are compared on the same input; otherwise it is the current text.
 */
export function pickCleanupInput(
	snapshot: Readonly<CleanupSnapshot> | null,
	draftId: string,
	text: string
): string {
	if (snapshot === null || snapshot.draftId !== draftId) return text;
	return text === snapshot.cleanedText ? snapshot.originalText : text;
}
