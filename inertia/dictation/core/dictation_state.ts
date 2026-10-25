export type DictationState =
	| { status: 'idle' }
	| { status: 'connecting' }
	| {
			status: 'recording';
			committedText: string;
			partialText: string;
			startedAt: number;
	  }
	| { status: 'finishing'; committedText: string; partialText: string }
	| { status: 'done'; text: string }
	| { status: 'cancelled' }
	| { status: 'error'; message: string };

export type DictationEvent =
	| { type: 'startRequested' }
	| { type: 'recordingStarted'; startedAt: number }
	| { type: 'finalReceived'; text: string }
	| { type: 'partialReceived'; text: string }
	| { type: 'stopRequested' }
	| { type: 'finished'; text: string }
	| { type: 'cancelRequested' }
	| { type: 'failed'; message: string };

export const INITIAL_DICTATION_STATE: DictationState = { status: 'idle' };

/**
 * `final` text is append-only and `partial` text replaces the previous
 * partial, matching the server's transcript contract. An event that does not
 * apply to the current state is ignored, so late events never resurrect a
 * dictation that already ended.
 */
export function dictationReducer(
	state: DictationState,
	event: DictationEvent
): DictationState {
	switch (event.type) {
		case 'startRequested':
			return isEnded(state) || state.status === 'idle'
				? { status: 'connecting' }
				: state;
		case 'recordingStarted':
			return state.status === 'connecting'
				? {
						status: 'recording',
						committedText: '',
						partialText: '',
						startedAt: event.startedAt,
					}
				: state;
		case 'finalReceived':
			return isLive(state)
				? { ...state, committedText: state.committedText + event.text }
				: state;
		case 'partialReceived':
			return isLive(state) ? { ...state, partialText: event.text } : state;
		case 'stopRequested':
			return state.status === 'recording'
				? {
						status: 'finishing',
						committedText: state.committedText,
						partialText: state.partialText,
					}
				: state;
		case 'finished':
			return state.status === 'finishing'
				? { status: 'done', text: event.text }
				: state;
		case 'cancelRequested':
			return state.status === 'connecting' || isLive(state)
				? { status: 'cancelled' }
				: state;
		case 'failed':
			return state.status === 'connecting' || isLive(state)
				? { status: 'error', message: event.message }
				: state;
	}
}

function isLive(
	state: DictationState
): state is Extract<DictationState, { status: 'recording' | 'finishing' }> {
	return state.status === 'recording' || state.status === 'finishing';
}

function isEnded(state: DictationState): boolean {
	return (
		state.status === 'done' ||
		state.status === 'cancelled' ||
		state.status === 'error'
	);
}
