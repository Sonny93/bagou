import { useEffect } from 'react';

import {
	CLEANABLE_STATUSES,
	type DictationState,
} from '~/dictation/core/dictation_state';

const DETECTION_DEBOUNCE_MS = 1500;

type UseDetectEditedCorrectionsOptions = {
	text: string;
	status: DictationState['status'];
	detectEdits: (text: string) => void;
};

/**
 * Looks for corrections in the draft once the user stopped typing for
 * `DETECTION_DEBOUNCE_MS`, only while the draft is editable.
 */
export function useDetectEditedCorrections({
	text,
	status,
	detectEdits,
}: Readonly<UseDetectEditedCorrectionsOptions>): void {
	useEffect(() => {
		if (!CLEANABLE_STATUSES.has(status)) return;
		const timeoutId = setTimeout(
			() => detectEdits(text),
			DETECTION_DEBOUNCE_MS
		);
		return () => clearTimeout(timeoutId);
	}, [text, status, detectEdits]);
}
