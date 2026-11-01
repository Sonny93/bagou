import type { SaveStatus } from './save_status';

const UNSAVED_SAVE_STATUSES: ReadonlySet<SaveStatus> = new Set([
	'pending',
	'saving',
	'failed',
	'not-in-history',
]);

/** Whether the text on screen may be missing from the history. */
export const isUnsavedSaveStatus = (saveStatus: SaveStatus): boolean =>
	UNSAVED_SAVE_STATUSES.has(saveStatus);
