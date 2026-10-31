const APPROACH_TIME_CONSTANT_MS = 250;
const SNAP_DISTANCE = 0.1;

/**
 * Moves `current` toward `target` along an exponential approach, never
 * backwards, and lands on `target` once it is within `SNAP_DISTANCE`.
 */
export function approachValue(
	current: number,
	target: number,
	elapsedMs: number,
	timeConstantMs: number = APPROACH_TIME_CONSTANT_MS
): number {
	if (target <= current) return current;
	const next =
		target - (target - current) * Math.exp(-elapsedMs / timeConstantMs);
	return target - next <= SNAP_DISTANCE ? target : next;
}
