import { useEffect, useRef, type RefObject } from 'react';

import type { DictationState } from '~/dictation/core/dictation_state';

const isFocusLost = (): boolean =>
	document.activeElement === null || document.activeElement === document.body;

/**
 * Once a re-clean ended in `done`, moves focus to the element, but only when
 * focus was lost (on the document body). The cleanup button stays mounted, so
 * focus normally stays on it, or on its menu trigger after a menu action;
 * focus that went elsewhere is left alone.
 */
export function useFocusAfterClean(
	status: DictationState['status'],
	targetRef: RefObject<HTMLElement | null>
): void {
	const previousStatusRef = useRef(status);

	useEffect(() => {
		const wasRetrying = previousStatusRef.current === 'recleaning';
		previousStatusRef.current = status;
		if (wasRetrying && status === 'done' && isFocusLost()) {
			targetRef.current?.focus();
		}
	}, [status, targetRef]);
}
