import type { CopyStatus } from './copy_status';

type DeriveCopyStatusInput = {
	draftText: string;
	lastCopiedText: string | null;
	hasLastCopyFailed: boolean;
};

/**
 * Compares the draft with what the last successful copy put on the clipboard.
 * A failed last copy wins over everything but a blank draft.
 */
export function deriveCopyStatus({
	draftText,
	lastCopiedText,
	hasLastCopyFailed,
}: Readonly<DeriveCopyStatusInput>): CopyStatus {
	if (draftText.trim() === '') return 'none';
	if (hasLastCopyFailed) return 'failed';
	if (lastCopiedText === null) return 'none';
	return lastCopiedText === draftText ? 'copied' : 'stale';
}
