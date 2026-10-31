export const MIN_VISIBLE_MS = 300;
export const LEAVE_MS = 200;

/**
 * How long a shown overlay must still stay visible before it may start
 * leaving; 0 means it can leave now.
 */
export function getRemainingVisibleMs(
	shownAt: number,
	now: number,
	minVisibleMs: number = MIN_VISIBLE_MS
): number {
	return Math.max(0, shownAt + minVisibleMs - now);
}
