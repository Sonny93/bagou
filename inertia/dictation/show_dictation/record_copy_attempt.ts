import type { CopyAttempt } from './copy_attempt';

type RecordCopyAttemptInput = {
	previous: CopyAttempt | null;
	draftId: string;
	text: string;
	isCopied: boolean;
};

/**
 * Folds one copy outcome into the tracking of its draft. A different draft
 * than the previous attempt's starts over.
 */
export function recordCopyAttempt({
	previous,
	draftId,
	text,
	isCopied,
}: Readonly<RecordCopyAttemptInput>): CopyAttempt {
	const sameDraftPrevious = previous?.draftId === draftId ? previous : null;
	const previousCopyCount = sameDraftPrevious?.copyCount ?? 0;

	if (!isCopied) {
		return {
			draftId,
			lastCopiedText: sameDraftPrevious?.lastCopiedText ?? null,
			hasLastCopyFailed: true,
			copyCount: previousCopyCount,
		};
	}
	return {
		draftId,
		lastCopiedText: text,
		hasLastCopyFailed: false,
		copyCount: previousCopyCount + 1,
	};
}
