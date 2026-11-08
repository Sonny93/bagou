/**
 * The key of the row to move the focus to once `resolvedKey` is done: the
 * next row not in `resolvedKeys`, else the closest one above it, else `null`.
 * `resolvedKeys` holds every row to skip, done or still being handled.
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
