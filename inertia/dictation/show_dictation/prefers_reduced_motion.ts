const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const prefersReducedMotion = (): boolean =>
	window.matchMedia(REDUCED_MOTION_QUERY).matches;
