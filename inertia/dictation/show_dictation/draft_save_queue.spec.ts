import { describe, expect, it, vi } from 'vitest';

import {
	createDraftSaveQueue,
	type SaveSettlement,
} from '~/dictation/show_dictation/draft_save_queue';
import type { DraftText } from '~/dictation/show_dictation/put_draft_text';

type PendingSend = {
	draft: DraftText;
	resolve: (isStored: boolean) => void;
	reject: (error: unknown) => void;
};

const buildQueue = () => {
	const sends: PendingSend[] = [];
	const settlements: SaveSettlement[] = [];
	const send = vi.fn<(draft: Readonly<DraftText>) => Promise<boolean>>(
		(draft) =>
			new Promise<boolean>((resolve, reject) => {
				sends.push({ draft, resolve, reject });
			})
	);
	const queue = createDraftSaveQueue({
		send,
		onSettled: (settlement) => settlements.push(settlement),
	});
	return { queue, send, sends, settlements };
};

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('createDraftSaveQueue', () => {
	it('should send at most one request at a time', async () => {
		const { queue, send } = buildQueue();

		queue.enqueue({ draftId: 'a', text: 'one' });
		queue.enqueue({ draftId: 'b', text: 'two' });
		await flushPromises();

		expect(send).toHaveBeenCalledTimes(1);
	});

	it('should send only the latest text of a draft queued while a request is in flight', async () => {
		const { queue, sends } = buildQueue();
		queue.enqueue({ draftId: 'a', text: 'one' });
		queue.enqueue({ draftId: 'a', text: 'two' });
		queue.enqueue({ draftId: 'a', text: 'three' });

		sends[0]?.resolve(true);
		await flushPromises();

		expect(sends.map(({ draft }) => draft.text)).toEqual(['one', 'three']);
	});

	it('should send each queued draft once the current request settled', async () => {
		const { queue, sends } = buildQueue();
		queue.enqueue({ draftId: 'a', text: 'one' });
		queue.enqueue({ draftId: 'b', text: 'two' });

		sends[0]?.resolve(true);
		await flushPromises();
		sends[1]?.resolve(true);
		await flushPromises();

		expect(sends.map(({ draft }) => draft)).toEqual([
			{ draftId: 'a', text: 'one' },
			{ draftId: 'b', text: 'two' },
		]);
	});

	it('should report the draft, the sent text and the server answer when a request succeeds', async () => {
		const { queue, sends, settlements } = buildQueue();
		queue.enqueue({ draftId: 'a', text: 'one' });
		queue.enqueue({ draftId: 'a', text: 'two' });

		sends[0]?.resolve(false);
		await flushPromises();

		expect(settlements).toEqual([
			{ draftId: 'a', text: 'one', isStored: false },
		]);
	});

	it('should report the error and still send the next queued text when a request fails', async () => {
		const { queue, sends, settlements } = buildQueue();
		const error = new Error('network');
		queue.enqueue({ draftId: 'a', text: 'one' });
		queue.enqueue({ draftId: 'b', text: 'two' });

		sends[0]?.reject(error);
		await flushPromises();
		sends[1]?.resolve(true);
		await flushPromises();

		expect(settlements).toEqual([
			{ draftId: 'a', text: 'one', error },
			{ draftId: 'b', text: 'two', isStored: true },
		]);
	});

	it('should send again once the queue is idle', async () => {
		const { queue, sends } = buildQueue();
		queue.enqueue({ draftId: 'a', text: 'one' });
		sends[0]?.resolve(true);
		await flushPromises();

		queue.enqueue({ draftId: 'a', text: 'two' });

		expect(sends).toHaveLength(2);
	});

	it('should report busy while requests remain and idle once the queue is empty', async () => {
		const sends: Array<(isStored: boolean) => void> = [];
		const busyChanges: boolean[] = [];
		const queue = createDraftSaveQueue({
			send: () => new Promise<boolean>((resolve) => sends.push(resolve)),
			onSettled: () => undefined,
			onBusyChange: (isBusy) => busyChanges.push(isBusy),
		});
		queue.enqueue({ draftId: 'a', text: 'one' });
		queue.enqueue({ draftId: 'a', text: 'two' });

		sends[0]?.(true);
		await flushPromises();
		sends[1]?.(true);
		await flushPromises();

		expect(busyChanges).toEqual([true, false]);
	});
});
