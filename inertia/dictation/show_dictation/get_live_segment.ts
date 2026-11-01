import type { DictationState } from '~/dictation/core/dictation_state';

export type LiveSegment = {
	committedText: string;
	partialText: string;
};

const EMPTY_SEGMENT: LiveSegment = { committedText: '', partialText: '' };

/**
 * The text being dictated, or `null` when no segment is live. A draft being
 * re-cleaned counts as an empty live segment, which makes it read-only.
 */
export const getLiveSegment = (state: DictationState): LiveSegment | null => {
	if (state.status === 'connecting' || state.status === 'recleaning') {
		return EMPTY_SEGMENT;
	}
	if (state.status === 'recording' || state.status === 'finishing') {
		return state;
	}
	if (state.status === 'cleaning') {
		return { committedText: state.rawText, partialText: '' };
	}
	return null;
};
