import type { CopyStatus } from './copy_status';

type DeriveCopyStatusInput = {
	draftText: string;
	copiedText: string | null;
	draftTextAtCopy: string | null;
	hasLastCopyFailed: boolean;
};

/**
 * Compares the draft with what the last successful copy put on the clipboard.
 * A failed last copy wins over everything but a blank draft. A copy of the
 * whole draft goes stale once the draft changes; a copy of only a part stays
 * `selection-copied` while the draft is unchanged, then is forgotten.
 */
export function deriveCopyStatus({
	draftText,
	copiedText,
	draftTextAtCopy,
	hasLastCopyFailed,
}: Readonly<DeriveCopyStatusInput>): CopyStatus {
	if (draftText.trim() === '') return 'none';
	if (hasLastCopyFailed) return 'failed';
	if (copiedText === null) return 'none';
	if (copiedText === draftText) return 'copied';
	if (copiedText !== draftTextAtCopy) {
		return draftText === draftTextAtCopy ? 'selection-copied' : 'none';
	}
	return 'stale';
}
