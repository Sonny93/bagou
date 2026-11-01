import type { CopyAttempt } from './copy_attempt';

type RecordCopyAttemptInput = {
	previous: CopyAttempt | null;
	draftId: string;
	text: string;
	draftText: string;
	isCopied: boolean;
};

/**
 * Folds one copy outcome into the tracking of its draft. `text` is what was
 * copied, `draftText` the draft at that moment. A different draft than the
 * previous attempt's starts over.
 */
export function recordCopyAttempt({
	previous,
	draftId,
	text,
	draftText,
	isCopied,
}: Readonly<RecordCopyAttemptInput>): CopyAttempt {
	const sameDraftPrevious = previous?.draftId === draftId ? previous : null;
	const previousCopyCount = sameDraftPrevious?.copyCount ?? 0;

	if (!isCopied) {
		return {
			draftId,
			copiedText: sameDraftPrevious?.copiedText ?? null,
			draftTextAtCopy: sameDraftPrevious?.draftTextAtCopy ?? null,
			hasLastCopyFailed: true,
			copyCount: previousCopyCount,
		};
	}
	return {
		draftId,
		copiedText: text,
		draftTextAtCopy: draftText,
		hasLastCopyFailed: false,
		copyCount: previousCopyCount + 1,
	};
}
