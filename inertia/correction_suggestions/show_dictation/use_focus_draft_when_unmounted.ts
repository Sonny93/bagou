import { useLayoutEffect, type RefObject } from 'react';

import { focusDraftTextarea } from '~/dictation/show_dictation/draft_textarea';

/** Sends the focus to the draft when the element goes away while it holds the focus, instead of letting it fall to the page. */
export function useFocusDraftWhenUnmounted(
	elementRef: RefObject<HTMLElement | null>
): void {
	useLayoutEffect(() => {
		const element = elementRef.current;
		return () => {
			if (element !== null && document.activeElement === element) {
				focusDraftTextarea();
			}
		};
	}, [elementRef]);
}
