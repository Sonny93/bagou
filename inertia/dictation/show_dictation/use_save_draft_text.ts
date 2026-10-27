import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useRef } from 'react';

import { putDraftText, type DraftText } from './put_draft_text';
import type { DictationState } from '~/dictation/core/dictation_state';
import { reportError } from '~/shared/errors/report_error';

const SAVE_DEBOUNCE_MS = 1500;
const SAVE_FAILURE_TOAST_ID = 'save-draft-failure';

const EDITABLE_STATUSES: ReadonlySet<DictationState['status']> = new Set([
	'idle',
	'done',
	'cancelled',
	'error',
]);

type UseSaveDraftTextOptions = {
	draftId: string;
	text: string;
	cleanedText: string;
	status: DictationState['status'];
};

/**
 * Keeps the history entry of the draft in step with the hand edits made after
 * the last dictated segment: once the text stopped changing for
 * `SAVE_DEBOUNCE_MS` while no segment is live, it is saved. While a segment is
 * live nothing is saved, since the server cleans and stores the whole draft at
 * its end; `cleanedText`, the draft as the server cleaned it, is the text the
 * history then holds.
 * Starting a new draft, or leaving the page, saves the pending text at once. A
 * failed save is reported by one toast (not repeated while it keeps failing)
 * and the text stays unsaved: the next change, new draft or page exit retries
 * it.
 */
export function useSaveDraftText({
	draftId,
	text,
	cleanedText,
	status,
}: Readonly<UseSaveDraftTextOptions>): void {
	const { t } = useLingui();
	const isEditable = EDITABLE_STATUSES.has(status);
	const knownRef = useRef<DraftText>({ draftId, text: cleanedText });
	const pendingRef = useRef<DraftText | null>(null);

	const flush = useCallback(
		async (isKeptAliveOnPageExit: boolean) => {
			const pending = pendingRef.current;
			if (!pending) return;
			try {
				await putDraftText(pending, { isKeptAliveOnPageExit });
			} catch (error) {
				reportError(
					t`Your edits could not be saved to the history, retrying on the next change`,
					error,
					{ toastId: SAVE_FAILURE_TOAST_ID }
				);
				return;
			}
			knownRef.current = pending;
			if (pendingRef.current === pending) pendingRef.current = null;
		},
		[t]
	);

	useEffect(() => {
		knownRef.current = { draftId, text: cleanedText };
	}, [draftId, cleanedText]);

	useEffect(() => {
		const isKnown =
			knownRef.current.draftId === draftId && knownRef.current.text === text;
		if (!isEditable || isKnown) {
			pendingRef.current = null;
			return;
		}
		pendingRef.current = { draftId, text };
		const timer = setTimeout(() => void flush(false), SAVE_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [draftId, text, isEditable, flush]);

	useEffect(() => () => void flush(false), [draftId, flush]);

	useEffect(() => {
		const handlePageHide = () => void flush(true);
		window.addEventListener('pagehide', handlePageHide);
		return () => window.removeEventListener('pagehide', handlePageHide);
	}, [flush]);
}
