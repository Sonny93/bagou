/**
 * The key of the row to move the focus to once `resolvedKey` is done: the
 * next unresolved row, else the closest unresolved one above it, else `null`.
 */
export function findNextUnresolvedKey(
	rowKeys: readonly string[],
	resolvedKeys: ReadonlySet<string>,
	resolvedKey: string
): string | null {
	const position = rowKeys.indexOf(resolvedKey);
	const isUnresolved = (key: string) => !resolvedKeys.has(key);
	const after = rowKeys.slice(position + 1).find(isUnresolved);
	if (after !== undefined) return after;
	const before = rowKeys.slice(0, Math.max(position, 0)).findLast(isUnresolved);
	return before ?? null;
}
