import { useCallback, useEffect, useRef } from 'react';

import { putDraftText, type DraftText } from './put_draft_text';
import type { DictationState } from '~/dictation/core/dictation_state';

const SAVE_DEBOUNCE_MS = 1500;

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
 * failed save is not shown, the history being a safety net, but the text stays
 * unsaved: the next change, new draft or page exit retries it.
 */
export function useSaveDraftText({
	draftId,
	text,
	cleanedText,
	status,
}: Readonly<UseSaveDraftTextOptions>): void {
	const isEditable = EDITABLE_STATUSES.has(status);
	const knownRef = useRef<DraftText>({ draftId, text: cleanedText });
	const pendingRef = useRef<DraftText | null>(null);

	const flush = useCallback(async (isKeptAliveOnPageExit: boolean) => {
		const pending = pendingRef.current;
		if (!pending) return;
		try {
			await putDraftText(pending, { isKeptAliveOnPageExit });
		} catch {
			return;
		}
		knownRef.current = pending;
		if (pendingRef.current === pending) pendingRef.current = null;
	}, []);

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
