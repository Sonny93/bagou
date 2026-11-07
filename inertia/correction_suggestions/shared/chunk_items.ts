/** Splits the items into consecutive chunks of at most `size` items. */
export function chunkItems<TItem>(
	items: readonly TItem[],
	size: number
): TItem[][] {
	const chunks: TItem[][] = [];
	for (let start = 0; start < items.length; start += size) {
		chunks.push(items.slice(start, start + size));
	}
	return chunks;
}
