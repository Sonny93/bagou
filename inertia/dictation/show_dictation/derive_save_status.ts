import type { SaveStatus } from '~/dictation/show_dictation/save_status';

export type ConfirmedSave = {
	draftId: string;
	text: string;
	isStored: boolean;
};

type DeriveSaveStatusInput = {
	draftId: string;
	text: string;
	confirmed: ConfirmedSave | null;
	isSaving: boolean;
	hasLastSaveFailed: boolean;
};

/**
 * Tells whether the draft is in the history. Only a confirmation for the very
 * draft and text on screen counts, so a late answer for an older text changes
 * nothing. A save in flight wins over a failure of the previous one.
 */
export function deriveSaveStatus({
	draftId,
	text,
	confirmed,
	isSaving,
	hasLastSaveFailed,
}: Readonly<DeriveSaveStatusInput>): SaveStatus {
	if (text.trim() === '') return 'none';
	if (isSaving) return 'saving';
	if (hasLastSaveFailed) return 'failed';
	const isConfirmed = confirmed?.draftId === draftId && confirmed.text === text;
	if (!isConfirmed) return 'pending';
	return confirmed.isStored ? 'saved' : 'not-in-history';
}
