import type { DictationState } from '~/dictation/core/dictation_state';

const ENDED_STATUSES: ReadonlySet<DictationState['status']> = new Set([
	'done',
	'cancelled',
	'error',
]);

/**
 * A new dictation may start once a dictation ended, or from the idle page as
 * soon as the draft holds text (typed or pasted) to start over from.
 */
export function canStartNewDictation(
	status: DictationState['status'],
	draftText: string
): boolean {
	if (ENDED_STATUSES.has(status)) return true;
	return status === 'idle' && draftText.trim() !== '';
}
