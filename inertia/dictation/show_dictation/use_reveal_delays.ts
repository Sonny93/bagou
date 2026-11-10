import { useState } from 'react';

import { assignRevealDelays } from '~/dictation/show_dictation/assign_reveal_delays';

const areDelaysEqual = (
	first: ReadonlyMap<string, number>,
	second: ReadonlyMap<string, number>
): boolean =>
	first.size === second.size &&
	[...first].every(([key, delay]) => second.get(key) === delay);

/**
 * Keeps the reveal delay of each word fixed from the render where its key
 * first appears. Rendering twice with the same keys returns the same delays.
 */
export function useRevealDelays(
	wordKeys: readonly string[]
): ReadonlyMap<string, number> {
	const [storedDelays, setStoredDelays] = useState<ReadonlyMap<string, number>>(
		new Map()
	);
	const delays = assignRevealDelays(storedDelays, wordKeys);
	if (!areDelaysEqual(delays, storedDelays)) setStoredDelays(delays);
	return delays;
}
