import { useEffect, useState } from 'react';

const TICK_INTERVAL_MS = 250;

/** Milliseconds since `startedAt`, refreshed a few times per second. */
export function useElapsedTime(startedAt: number): number {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
		return () => clearInterval(timer);
	}, [startedAt]);

	return Math.max(0, now - startedAt);
}
