import { isUnsavedSaveStatus } from './is_unsaved_save_status';
import type { SaveStatus } from './save_status';
import type { DictationState } from '~/dictation/core/dictation_state';

export type LeaveRisk = 'dictation-in-progress' | 'unsaved-text';

const IN_PROGRESS_STATUSES: ReadonlySet<DictationState['status']> = new Set([
	'connecting',
	'recording',
	'finishing',
	'cleaning',
	'recleaning',
]);

/**
 * What the user would lose by leaving the page now: the running dictation,
 * which only lands in the draft once it ends, wins over unsaved draft text.
 */
export function getLeaveRisk(
	status: DictationState['status'],
	saveStatus: SaveStatus
): LeaveRisk | null {
	if (IN_PROGRESS_STATUSES.has(status)) return 'dictation-in-progress';
	return isUnsavedSaveStatus(saveStatus) ? 'unsaved-text' : null;
}
