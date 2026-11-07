import { useEffect, useRef, type RefObject } from 'react';

import type { CorrectionPair } from '~/dictation/core/correction_pair';
import { focusDraftTextarea } from '~/dictation/show_dictation/draft_textarea';

type UseStripFocusReturn = {
	expectFocusMove: () => void;
	cancelFocusMove: () => void;
};

/**
 * After a suggestion was remembered or dismissed, moves the focus (which sat
 * on the button of the suggestion that just left) to the button of the next
 * suggestion, or back to the draft when there is none. It only moves when
 * `expectFocusMove` was called, never for a suggestion that arrives on its own.
 */
export function useStripFocus(
	current: CorrectionPair | undefined,
	rememberButtonRef: RefObject<HTMLButtonElement | null>
): UseStripFocusReturn {
	const isFocusMoveExpectedRef = useRef(false);

	useEffect(() => {
		if (!isFocusMoveExpectedRef.current) return;
		isFocusMoveExpectedRef.current = false;
		if (current === undefined) return focusDraftTextarea();
		rememberButtonRef.current?.focus();
	}, [current, rememberButtonRef]);

	return {
		expectFocusMove: () => {
			isFocusMoveExpectedRef.current = true;
		},
		cancelFocusMove: () => {
			isFocusMoveExpectedRef.current = false;
		},
	};
}
