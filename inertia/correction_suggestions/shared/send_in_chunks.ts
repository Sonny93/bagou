import { chunkItems } from '~/correction_suggestions/shared/chunk_items';

/**
 * Sends the items one chunk after the other and stops at the first chunk
 * that fails, so the caller knows everything before it went through.
 */
export async function sendInChunks<TItem>(
	items: readonly TItem[],
	size: number,
	send: (chunk: readonly TItem[]) => Promise<void>
): Promise<void> {
	await chunkItems(items, size).reduce(
		(previous, chunk) => previous.then(() => send(chunk)),
		Promise.resolve()
	);
}
