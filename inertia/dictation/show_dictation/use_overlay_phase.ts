import { useEffect, useRef, useState } from 'react';

import {
	getRemainingVisibleMs,
	LEAVE_MS,
	MIN_VISIBLE_MS,
} from '~/dictation/show_dictation/overlay_timing';
import { prefersReducedMotion } from '~/dictation/show_dictation/prefers_reduced_motion';

export type OverlayPhase = 'hidden' | 'entering' | 'visible' | 'leaving';

/**
 * Shows at once when `isActive` turns on, stays at least `MIN_VISIBLE_MS`,
 * then leaves over `LEAVE_MS`. `entering` is the frame where the overlay is
 * mounted but not yet styled as shown, so its enter transition can run.
 */
export function useOverlayPhase(isActive: boolean): OverlayPhase {
	const [phase, setPhase] = useState<OverlayPhase>('hidden');
	const shownAtRef = useRef(0);

	useEffect(() => {
		if (!isActive || (phase !== 'hidden' && phase !== 'leaving')) return;
		const frameId = requestAnimationFrame(() => {
			if (phase === 'leaving') {
				setPhase('visible');
				return;
			}
			shownAtRef.current = Date.now();
			setPhase(prefersReducedMotion() ? 'visible' : 'entering');
		});
		return () => cancelAnimationFrame(frameId);
	}, [isActive, phase]);

	useEffect(() => {
		if (phase !== 'entering') return;
		let innerFrameId = 0;
		const outerFrameId = requestAnimationFrame(() => {
			innerFrameId = requestAnimationFrame(() => setPhase('visible'));
		});
		return () => {
			cancelAnimationFrame(outerFrameId);
			cancelAnimationFrame(innerFrameId);
		};
	}, [phase]);

	useEffect(() => {
		if (isActive || (phase !== 'entering' && phase !== 'visible')) return;
		const remainingMs = getRemainingVisibleMs(
			shownAtRef.current,
			Date.now(),
			MIN_VISIBLE_MS
		);
		const timer = setTimeout(() => setPhase('leaving'), remainingMs);
		return () => clearTimeout(timer);
	}, [isActive, phase]);

	useEffect(() => {
		if (phase !== 'leaving') return;
		const leaveMs = prefersReducedMotion() ? 0 : LEAVE_MS;
		const timer = setTimeout(() => setPhase('hidden'), leaveMs);
		return () => clearTimeout(timer);
	}, [phase]);

	return phase;
}
