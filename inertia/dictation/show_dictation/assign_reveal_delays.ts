const REVEAL_STEP_MS = 60;
const MAX_REVEAL_DELAY_MS = 240;

/**
 * Reveal delay of each word key: a key already known keeps its delay, new
 * keys are staggered in reading order up to a cap, absent keys are dropped.
 */
export function assignRevealDelays(
	previousDelays: ReadonlyMap<string, number>,
	wordKeys: readonly string[]
): Map<string, number> {
	const delays = new Map<string, number>();
	let newWordCount = 0;
	for (const key of wordKeys) {
		const previousDelay = previousDelays.get(key);
		if (previousDelay !== undefined) {
			delays.set(key, previousDelay);
			continue;
		}
		delays.set(
			key,
			Math.min(newWordCount * REVEAL_STEP_MS, MAX_REVEAL_DELAY_MS)
		);
		newWordCount += 1;
	}
	return delays;
}
