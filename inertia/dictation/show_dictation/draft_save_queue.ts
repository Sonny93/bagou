import type { DraftText } from './put_draft_text';

export type SaveSettlement =
	| { draftId: string; text: string; isStored: boolean }
	| { draftId: string; text: string; error: unknown };

type DraftSaveQueueOptions = {
	send: (draft: Readonly<DraftText>) => Promise<boolean>;
	onSettled: (settlement: Readonly<SaveSettlement>) => void;
	onBusyChange?: (isBusy: boolean) => void;
};

export type DraftSaveQueue = {
	enqueue: (draft: Readonly<DraftText>) => void;
};

/**
 * Sends at most one save at a time. While one is in flight, only the latest
 * text per draft is kept and sent once the current request settles; drafts
 * are sent in the order they were first queued. Every request reports, once
 * settled, the exact text it sent, and a failure never blocks the next one.
 * `onBusyChange` tells when the queue stops being idle and when it is empty
 * again.
 */
export function createDraftSaveQueue({
	send,
	onSettled,
	onBusyChange,
}: Readonly<DraftSaveQueueOptions>): DraftSaveQueue {
	const waitingTextByDraftId = new Map<string, string>();
	let isSending = false;

	const settle = async (
		draft: Readonly<DraftText>
	): Promise<SaveSettlement> => {
		try {
			return { ...draft, isStored: await send(draft) };
		} catch (error) {
			return { ...draft, error };
		}
	};

	const sendNext = async (): Promise<void> => {
		const next = waitingTextByDraftId.entries().next();
		if (next.done) {
			onBusyChange?.(false);
			return;
		}
		const [draftId, text] = next.value;
		waitingTextByDraftId.delete(draftId);
		isSending = true;
		const settlement = await settle({ draftId, text });
		isSending = false;
		onSettled(settlement);
		await sendNext();
	};

	const enqueue = (draft: Readonly<DraftText>): void => {
		waitingTextByDraftId.set(draft.draftId, draft.text);
		if (isSending) return;
		onBusyChange?.(true);
		void sendNext();
	};

	return { enqueue };
}
