import { describe, expect, it, vi } from 'vitest';

import { createNewDictationRequester } from './create_new_dictation_request';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('createNewDictationRequester', () => {
	it('should ask before starting when the draft is unsaved', async () => {
		const confirm = vi.fn<() => Promise<boolean>>(() => Promise.resolve(true));
		const startNew = vi.fn<() => void>();

		await createNewDictationRequester().request({
			isUnsaved: true,
			confirm,
			startNew,
		});

		expect(confirm).toHaveBeenCalledTimes(1);
		expect(startNew).toHaveBeenCalledTimes(1);
	});

	it('should start without asking when the draft is saved', async () => {
		const confirm = vi.fn<() => Promise<boolean>>(() => Promise.resolve(true));
		const startNew = vi.fn<() => void>();

		await createNewDictationRequester().request({
			isUnsaved: false,
			confirm,
			startNew,
		});

		expect(confirm).not.toHaveBeenCalled();
		expect(startNew).toHaveBeenCalledTimes(1);
	});

	it('should do nothing when the confirmation is declined', async () => {
		const startNew = vi.fn<() => void>();

		await createNewDictationRequester().request({
			isUnsaved: true,
			confirm: () => Promise.resolve(false),
			startNew,
		});

		expect(startNew).not.toHaveBeenCalled();
	});

	it('should not ask again while a confirmation is open', async () => {
		const requester = createNewDictationRequester();
		const confirm = vi.fn<() => Promise<boolean>>(
			() => new Promise<boolean>(() => undefined)
		);
		const startNew = vi.fn<() => void>();

		void requester.request({ isUnsaved: true, confirm, startNew });
		void requester.request({ isUnsaved: true, confirm, startNew });
		await flushPromises();

		expect(confirm).toHaveBeenCalledTimes(1);
	});

	it('should ask again once the previous confirmation is closed', async () => {
		const requester = createNewDictationRequester();
		const confirm = vi.fn<() => Promise<boolean>>(() => Promise.resolve(false));
		const startNew = vi.fn<() => void>();

		await requester.request({ isUnsaved: true, confirm, startNew });
		await requester.request({ isUnsaved: true, confirm, startNew });

		expect(confirm).toHaveBeenCalledTimes(2);
	});
});
