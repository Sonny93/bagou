import type { ReviewItem } from '~/correction_suggestions/shared/build_review_list';

/**
 * The rows to show once the server's list changed: the ones shown before
 * stay in place while they are still waiting or already resolved here (so
 * their result stays visible), then come the new ones.
 */
export function retainResolvedRows(
	previous: readonly ReviewItem[],
	current: readonly ReviewItem[],
	resolvedKeys: ReadonlySet<string>
): readonly ReviewItem[] {
	const currentKeys = new Set(current.map((item) => item.key));
	const kept = previous.filter(
		(item) => resolvedKeys.has(item.key) || currentKeys.has(item.key)
	);
	const keptKeys = new Set(kept.map((item) => item.key));
	return [...kept, ...current.filter((item) => !keptKeys.has(item.key))];
}
