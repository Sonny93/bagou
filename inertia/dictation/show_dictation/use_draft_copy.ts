import { useCallback, useState } from 'react';

import type { CopyAttempt } from './copy_attempt';
import type { CopyStatus } from './copy_status';
import { deriveCopyStatus } from './derive_copy_status';
import { recordCopyAttempt } from './record_copy_attempt';
import { copyToClipboard } from '~/shared/lib/copy_to_clipboard';

type UseDraftCopyOptions = {
	draftId: string;
	draftText: string;
};

type UseDraftCopyReturn = {
	copyStatus: CopyStatus;
	copyCount: number;
	copyDraft: (text: string) => Promise<boolean>;
	recordSelectionCopy: (copiedText: string) => void;
};

/**
 * Copies draft text to the clipboard and tracks what the last copy put there,
 * so the status tells whether the clipboard still matches the draft.
 * `copyDraft` always copies the whole draft; `recordSelectionCopy` records a
 * native copy made from the draft, which cannot fail. The tracking belongs to
 * one draft: a new `draftId` starts over.
 */
export function useDraftCopy({
	draftId,
	draftText,
}: Readonly<UseDraftCopyOptions>): UseDraftCopyReturn {
	const [attempt, setAttempt] = useState<CopyAttempt | null>(null);

	const copyDraft = useCallback(
		async (text: string) => {
			const isCopied = await copyToClipboard(text);
			setAttempt((previous) =>
				recordCopyAttempt({
					previous,
					draftId,
					text,
					draftText: text,
					isCopied,
				})
			);
			return isCopied;
		},
		[draftId]
	);

	const recordSelectionCopy = useCallback(
		(copiedText: string) => {
			if (copiedText === '') return;
			setAttempt((previous) =>
				recordCopyAttempt({
					previous,
					draftId,
					text: copiedText,
					draftText,
					isCopied: true,
				})
			);
		},
		[draftId, draftText]
	);

	const currentAttempt = attempt?.draftId === draftId ? attempt : null;
	const copyStatus = deriveCopyStatus({
		draftText,
		copiedText: currentAttempt?.copiedText ?? null,
		draftTextAtCopy: currentAttempt?.draftTextAtCopy ?? null,
		hasLastCopyFailed: currentAttempt?.hasLastCopyFailed ?? false,
	});

	return {
		copyStatus,
		copyCount: currentAttempt?.copyCount ?? 0,
		copyDraft,
		recordSelectionCopy,
	};
}
