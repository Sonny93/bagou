import { useEffect, useRef, useState } from 'react';

import { approachValue } from './approach_value';
import { prefersReducedMotion } from './prefers_reduced_motion';

/**
 * Follows `target` smoothly with an animation frame loop that stops once it
 * settled. Under reduced motion it jumps straight to the target.
 */
export function useTweenedValue(target: number): number {
	const [value, setValue] = useState(0);
	const currentRef = useRef(0);

	const isReducedMotion = prefersReducedMotion();

	useEffect(() => {
		if (isReducedMotion) return;
		let frameId = 0;
		let lastTime = performance.now();
		const step = (time: number) => {
			const elapsedMs = time - lastTime;
			lastTime = time;
			const next = approachValue(currentRef.current, target, elapsedMs);
			currentRef.current = next;
			setValue(next);
			if (next !== target) frameId = requestAnimationFrame(step);
		};
		frameId = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frameId);
	}, [target, isReducedMotion]);

	return isReducedMotion ? target : value;
}
