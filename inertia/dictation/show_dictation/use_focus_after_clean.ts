import { useEffect, useRef, type RefObject } from 'react';

import type { DictationState } from '~/dictation/core/dictation_state';

const isFocusLost = (): boolean =>
	document.activeElement === null || document.activeElement === document.body;

/**
 * Once a cleanup retry succeeded and its button disappeared, moves focus to
 * the element, but only when focus was lost with the button: focus that
 * went elsewhere, or stayed on the button after a failure, is left alone.
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
