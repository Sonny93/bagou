import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
	CLEANABLE_STATUSES,
	type DictationEvent,
	type DictationState,
} from '~/dictation/core/dictation_state';
import type { CleanupSnapshot } from '~/dictation/show_dictation/cleanup_snapshot';
import { pickCleanupInput } from '~/dictation/show_dictation/pick_cleanup_input';
import { requestDraftCleanup } from '~/dictation/show_dictation/request_draft_cleanup';
import type { CleanupQuality } from '~/shared/cleanup_quality';
import { describeCleanupRequestError } from '~/shared/errors/describe_cleanup_request_error';
import { reportError } from '~/shared/errors/report_error';
import { CLEANUP_REQUEST_TIMEOUT_MS } from '~/shared/lib/cleanup_request_timeout';

type UseCleanDraftOptions = {
	status: DictationState['status'];
	dispatch: (event: DictationEvent) => void;
	draftId: string;
	draftText: string;
	replaceDraft: (text: string) => string;
	copyDraft: (text: string) => Promise<boolean>;
	savedQuality: CleanupQuality;
};

type UseCleanDraftReturn = {
	cleanDraft: () => void;
	cleanDraftWith: (quality: CleanupQuality) => void;
	snapshot: CleanupSnapshot | null;
};

/**
 * Cleans the current draft on demand, hand edits included, whenever no
 * dictation or cleanup is running. On success the cleaned text replaces the draft and is copied; on
 * failure the draft stays as it is and the error is reported. A click while
 * a cleanup runs, and a result for a draft that is no longer the current one,
 * are ignored; leaving the page aborts the request. `cleanDraft` uses the
 * saved quality, `cleanDraftWith` another one for that call only. Each success
 * keeps a snapshot of the input and the result, and a new cleanup right after
 * starts from the same input (see `pickCleanupInput`).
 */
export function useCleanDraft({
	status,
	dispatch,
	draftId,
	draftText,
	replaceDraft,
	copyDraft,
	savedQuality,
}: Readonly<UseCleanDraftOptions>): UseCleanDraftReturn {
	const { i18n } = useLingui();
	const statusRef = useRef(status);
	const draftIdRef = useRef(draftId);
	const [snapshot, setSnapshot] = useState<CleanupSnapshot | null>(null);
	const controllerRef = useRef<AbortController | null>(null);
	const isCleaningDraftRef = useRef(false);
	useEffect(() => {
		statusRef.current = status;
		draftIdRef.current = draftId;
	}, [status, draftId]);
	useEffect(() => () => controllerRef.current?.abort(), []);

	const run = useCallback(
		async (quality: CleanupQuality | undefined) => {
			if (!CLEANABLE_STATUSES.has(statusRef.current)) return;
			if (isCleaningDraftRef.current || draftText.trim() === '') return;
			isCleaningDraftRef.current = true;
			const controller = new AbortController();
			controllerRef.current = controller;
			const requestedDraftId = draftId;
			const input = pickCleanupInput(snapshot, requestedDraftId, draftText);
			dispatch({ type: 'cleanupRequested' });
			try {
				const cleanedText = await requestDraftCleanup({
					draftId: requestedDraftId,
					text: input,
					cleanupQuality: quality,
					signal: controller.signal,
					timeoutMs: CLEANUP_REQUEST_TIMEOUT_MS,
				});
				if (draftIdRef.current !== requestedDraftId) {
					dispatch({ type: 'cleaned', isCleaned: false });
					return;
				}
				setSnapshot({
					draftId: requestedDraftId,
					originalText: input,
					cleanedText,
					quality: quality ?? savedQuality,
				});
				await copyDraft(replaceDraft(cleanedText));
				dispatch({ type: 'cleaned', isCleaned: true });
			} catch (error) {
				if (controller.signal.aborted) return;
				dispatch({ type: 'cleaned', isCleaned: false });
				reportError(describeCleanupRequestError(error, i18n), error);
			} finally {
				isCleaningDraftRef.current = false;
			}
		},
		[
			dispatch,
			draftId,
			draftText,
			snapshot,
			savedQuality,
			replaceDraft,
			copyDraft,
			i18n,
		]
	);

	const cleanDraft = () => void run(undefined);
	const cleanDraftWith = (quality: CleanupQuality) => void run(quality);

	return { cleanDraft, cleanDraftWith, snapshot };
}
