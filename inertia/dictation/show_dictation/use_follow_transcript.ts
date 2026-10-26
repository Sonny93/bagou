import { useLayoutEffect, useRef, type RefObject } from 'react';

const NEAR_BOTTOM_THRESHOLD_PX = 96;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const isNearBottom = (element: HTMLElement): boolean =>
	element.scrollHeight - element.scrollTop - element.clientHeight <=
	NEAR_BOTTOM_THRESHOLD_PX;

/**
 * Keeps the end of a growing transcript in view while `isFollowing` is true,
 * unless the user scrolled away from the bottom to read earlier text.
 */
export function useFollowTranscript(
	scrollerRef: RefObject<HTMLElement | null>,
	transcriptLength: number,
	isFollowing: boolean
): void {
	const wasNearBottomRef = useRef(true);

	useLayoutEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller || !isFollowing) return;
		if (wasNearBottomRef.current) {
			const isReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
			scroller.scrollTo({
				top: scroller.scrollHeight,
				behavior: isReducedMotion ? 'instant' : 'smooth',
			});
		}
	}, [scrollerRef, transcriptLength, isFollowing]);

	useLayoutEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;
		const handleScroll = () => {
			wasNearBottomRef.current = isNearBottom(scroller);
		};
		scroller.addEventListener('scroll', handleScroll, { passive: true });
		return () => scroller.removeEventListener('scroll', handleScroll);
	}, [scrollerRef]);
}
