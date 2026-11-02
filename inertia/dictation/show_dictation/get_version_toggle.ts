import type { CleanupSnapshot } from '~/dictation/show_dictation/cleanup_snapshot';

export type VersionToggle = 'show-original' | 'show-cleaned';

/**
 * Which version the user can switch to, if the text is exactly one of the two
 * versions of the last re-clean of this draft; none when both are identical.
 */
export function getVersionToggle(
	snapshot: Readonly<CleanupSnapshot> | null,
	draftId: string,
	text: string
): VersionToggle | null {
	if (snapshot === null || snapshot.draftId !== draftId) return null;
	if (snapshot.originalText === snapshot.cleanedText) return null;
	if (text === snapshot.cleanedText) return 'show-original';
	if (text === snapshot.originalText) return 'show-cleaned';
	return null;
}
