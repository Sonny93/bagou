import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useRef } from 'react';

import { requestDraftCleanup } from './request_draft_cleanup';
import {
	CLEANABLE_STATUSES,
	type DictationEvent,
	type DictationState,
} from '~/dictation/core/dictation_state';
import { describeCleanupRequestError } from '~/shared/errors/describe_cleanup_request_error';
import { reportError } from '~/shared/errors/report_error';

/** The server may take up to 30 s to clean; ky would give up after 10 s. */
const CLEAN_DRAFT_TIMEOUT_MS = 35_000;

type UseCleanDraftOptions = {
	status: DictationState['status'];
	dispatch: (event: DictationEvent) => void;
	draftId: string;
	draftText: string;
	replaceDraft: (text: string) => string;
	copyDraft: (text: string) => Promise<boolean>;
};

/**
 * Cleans the current draft on demand, hand edits included, whenever no
 * dictation or cleanup is running. On success the cleaned text replaces the draft and is copied; on
 * failure the draft stays as it is and the error is reported. A click while
 * a cleanup runs, and a result for a draft that is no longer the current one,
 * are ignored; leaving the page aborts the request.
 */
export function useCleanDraft({
	status,
	dispatch,
	draftId,
	draftText,
	replaceDraft,
	copyDraft,
}: Readonly<UseCleanDraftOptions>): () => void {
	const { i18n } = useLingui();
	const statusRef = useRef(status);
	const draftIdRef = useRef(draftId);
	const controllerRef = useRef<AbortController | null>(null);
	const isCleaningDraftRef = useRef(false);
	useEffect(() => {
		statusRef.current = status;
		draftIdRef.current = draftId;
	}, [status, draftId]);
	useEffect(() => () => controllerRef.current?.abort(), []);

	const retry = useCallback(async () => {
		if (!CLEANABLE_STATUSES.has(statusRef.current)) return;
		if (isCleaningDraftRef.current || draftText.trim() === '') return;
		isCleaningDraftRef.current = true;
		const controller = new AbortController();
		controllerRef.current = controller;
		const requestedDraftId = draftId;
		dispatch({ type: 'cleanupRequested' });
		try {
			const cleanedText = await requestDraftCleanup({
				draftId: requestedDraftId,
				text: draftText,
				signal: controller.signal,
				timeoutMs: CLEAN_DRAFT_TIMEOUT_MS,
			});
			if (draftIdRef.current !== requestedDraftId) {
				dispatch({ type: 'cleaned', isCleaned: false });
				return;
			}
			await copyDraft(replaceDraft(cleanedText));
			dispatch({ type: 'cleaned', isCleaned: true });
		} catch (error) {
			if (controller.signal.aborted) return;
			dispatch({ type: 'cleaned', isCleaned: false });
			reportError(describeCleanupRequestError(error, i18n), error);
		} finally {
			isCleaningDraftRef.current = false;
		}
	}, [dispatch, draftId, draftText, replaceDraft, copyDraft, i18n]);

	return () => void retry();
}
