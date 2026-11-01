import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useRef, useState } from 'react';

import { deriveSaveStatus, type ConfirmedSave } from './derive_save_status';
import {
	createDraftSaveQueue,
	type DraftSaveQueue,
	type SaveSettlement,
} from './draft_save_queue';
import { putDraftText, type DraftText } from './put_draft_text';
import type { SaveStatus } from './save_status';
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

export type ExplicitSave = {
	count: number;
	isStored: boolean;
};

type UseSaveDraftTextReturn = {
	saveStatus: SaveStatus;
	explicitSave: ExplicitSave | null;
	saveNow: () => void;
};

const isSameDraftText = (
	first: Readonly<DraftText> | null,
	second: Readonly<DraftText>
): boolean => first?.draftId === second.draftId && first.text === second.text;

/**
 * Keeps the history entry of the draft in step with the hand edits made after
 * the last dictated segment: once the text stopped changing for
 * `SAVE_DEBOUNCE_MS` while no segment is live, it is saved. While a segment is
 * live nothing is saved, since the server cleans and stores the whole draft at
 * its end; `cleanedText`, the draft as the server cleaned it, is the text the
 * history then holds.
 * Starting a new draft saves the pending text at once; leaving the page sends
 * it with `keepalive`, outside the queue. Saves go through a queue with one
 * request in flight at a time. A failed save is reported by one toast (not
 * repeated while it keeps failing) and the text stays unsaved: the next
 * change, new draft or page exit retries it.
 * `saveStatus` tells, from the server's own answers, whether the text on
 * screen is in the history; the server stores nothing for a draft without a
 * dictated segment (`not-in-history`). `saveNow` saves immediately and, once
 * the server answered, `explicitSave` carries the outcome of that save with an
 * incremented `count`, so repeated saves can be told apart.
 */
export function useSaveDraftText({
	draftId,
	text,
	cleanedText,
	status,
}: Readonly<UseSaveDraftTextOptions>): UseSaveDraftTextReturn {
	const { t } = useLingui();
	const isEditable = EDITABLE_STATUSES.has(status);
	const [confirmed, setConfirmed] = useState<ConfirmedSave | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [failedDraftId, setFailedDraftId] = useState<string | null>(null);
	const [explicitSave, setExplicitSave] = useState<ExplicitSave | null>(null);
	const [lastSeed, setLastSeed] = useState<DraftText | null>(null);
	const confirmedRef = useRef<ConfirmedSave | null>(null);
	const queueRef = useRef<DraftSaveQueue | null>(null);
	const pendingRef = useRef<DraftText | null>(null);
	const explicitRef = useRef<DraftText | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const seed: DraftText = { draftId, text: cleanedText };
	if (cleanedText !== '' && !isSameDraftText(lastSeed, seed)) {
		setLastSeed(seed);
		setConfirmed({ ...seed, isStored: true });
	}

	const settleFailure = useCallback(
		(failure: Extract<SaveSettlement, { error: unknown }>) => {
			setFailedDraftId(failure.draftId);
			if (isSameDraftText(explicitRef.current, failure)) {
				explicitRef.current = null;
			}
			reportError(
				t`Your edits could not be saved to the history, retrying on the next change`,
				failure.error,
				{ toastId: SAVE_FAILURE_TOAST_ID }
			);
		},
		[t]
	);

	const settle = useCallback(
		(settlement: Readonly<SaveSettlement>) => {
			if ('error' in settlement) return settleFailure(settlement);
			const {
				draftId: settledDraftId,
				text: settledText,
				isStored,
			} = settlement;
			setConfirmed({ draftId: settledDraftId, text: settledText, isStored });
			setFailedDraftId((current) =>
				current === settledDraftId ? null : current
			);
			if (isSameDraftText(pendingRef.current, settlement)) {
				pendingRef.current = null;
			}
			if (isSameDraftText(explicitRef.current, settlement)) {
				explicitRef.current = null;
				setExplicitSave((current) => ({
					count: (current?.count ?? 0) + 1,
					isStored,
				}));
			}
		},
		[settleFailure]
	);

	const settleRef = useRef(settle);
	useEffect(() => {
		settleRef.current = settle;
	}, [settle]);

	useEffect(() => {
		queueRef.current = createDraftSaveQueue({
			send: (draft) => putDraftText(draft, { isKeptAliveOnPageExit: false }),
			onSettled: (settlement) => settleRef.current(settlement),
			onBusyChange: setIsSaving,
		});
	}, []);

	useEffect(() => {
		confirmedRef.current = confirmed;
	}, [confirmed]);

	const flushOnPageExit = useCallback(async () => {
		const pending = pendingRef.current;
		if (!pending) return;
		try {
			const isStored = await putDraftText(pending, {
				isKeptAliveOnPageExit: true,
			});
			settle({ ...pending, isStored });
		} catch (error) {
			settle({ ...pending, error });
		}
	}, [settle]);

	const flush = useCallback(() => {
		if (pendingRef.current) queueRef.current?.enqueue(pendingRef.current);
	}, []);

	const saveNow = useCallback(() => {
		if (!isEditable || text.trim() === '') return;
		if (timerRef.current) clearTimeout(timerRef.current);
		explicitRef.current = { draftId, text };
		pendingRef.current = { draftId, text };
		flush();
	}, [isEditable, text, draftId, flush]);

	useEffect(() => {
		const isKnown = isSameDraftText(confirmedRef.current, { draftId, text });
		if (!isEditable || isKnown) {
			pendingRef.current = null;
			return;
		}
		pendingRef.current = { draftId, text };
		timerRef.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [draftId, text, isEditable, flush]);

	useEffect(() => () => flush(), [draftId, flush]);

	useEffect(() => {
		const handlePageHide = () => void flushOnPageExit();
		window.addEventListener('pagehide', handlePageHide);
		return () => window.removeEventListener('pagehide', handlePageHide);
	}, [flushOnPageExit]);

	const saveStatus = deriveSaveStatus({
		draftId,
		text,
		confirmed,
		isSaving,
		hasLastSaveFailed: failedDraftId === draftId,
	});

	return { saveStatus, explicitSave, saveNow };
}
