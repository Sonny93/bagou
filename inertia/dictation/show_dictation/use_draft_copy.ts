import { useCallback, useState } from 'react';

import type { CopyStatus } from './copy_status';
import { deriveCopyStatus } from './derive_copy_status';
import { copyToClipboard } from '~/shared/lib/copy_to_clipboard';

type CopyAttempt = {
	draftId: string;
	lastCopiedText: string | null;
	hasLastCopyFailed: boolean;
};

type UseDraftCopyOptions = {
	draftId: string;
	draftText: string;
};

type UseDraftCopyReturn = {
	copyStatus: CopyStatus;
	copyDraft: (text: string) => Promise<boolean>;
};

/**
 * Copies draft text to the clipboard and tracks what the last copy put there,
 * so the status tells whether the clipboard still matches the draft. The
 * tracking belongs to one draft: a new `draftId` starts over.
 */
export function useDraftCopy({
	draftId,
	draftText,
}: Readonly<UseDraftCopyOptions>): UseDraftCopyReturn {
	const [attempt, setAttempt] = useState<CopyAttempt | null>(null);

	const copyDraft = useCallback(
		async (text: string) => {
			const isCopied = await copyToClipboard(text);
			setAttempt((previous) => ({
				draftId,
				lastCopiedText: isCopied
					? text
					: previous?.draftId === draftId
						? previous.lastCopiedText
						: null,
				hasLastCopyFailed: !isCopied,
			}));
			return isCopied;
		},
		[draftId]
	);

	const currentAttempt = attempt?.draftId === draftId ? attempt : null;
	const copyStatus = deriveCopyStatus({
		draftText,
		lastCopiedText: currentAttempt?.lastCopiedText ?? null,
		hasLastCopyFailed: currentAttempt?.hasLastCopyFailed ?? false,
	});

	return { copyStatus, copyDraft };
}
