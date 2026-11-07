import { describe, expect, it, vi } from 'vitest';

import { sendInChunks } from '~/correction_suggestions/shared/send_in_chunks';

describe('sendInChunks', () => {
	it('should send every chunk of at most the size in order when all succeed', async () => {
		const send = vi
			.fn<(chunk: readonly number[]) => Promise<void>>()
			.mockResolvedValue(undefined);
		const items = Array.from({ length: 450 }, (_, index) => index);

		await sendInChunks(items, 200, send);

		expect(send.mock.calls.map(([chunk]) => chunk.length)).toEqual([
			200, 200, 50,
		]);
	});

	it('should stop at the first failing chunk and reject when a send fails', async () => {
		const send = vi
			.fn<(chunk: readonly number[]) => Promise<void>>()
			.mockResolvedValueOnce(undefined)
			.mockRejectedValueOnce(new Error('network'));

		await expect(sendInChunks([1, 2, 3, 4, 5, 6], 2, send)).rejects.toThrow(
			'network'
		);
		expect(send).toHaveBeenCalledTimes(2);
	});

	it('should send nothing when there are no items', async () => {
		const send = vi.fn<(chunk: readonly number[]) => Promise<void>>();

		await sendInChunks([], 200, send);

		expect(send).not.toHaveBeenCalled();
	});
});
