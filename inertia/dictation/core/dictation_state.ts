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
	| { status: 'cleaning'; rawText: string; progress: number }
	| { status: 'recleaning' }
	| { status: 'done'; isCleaned: boolean }
	| { status: 'cancelled'; hasKeptText: boolean }
	| { status: 'error'; message: string };

export type DictationEvent =
	| { type: 'startRequested' }
	| { type: 'recordingStarted'; startedAt: number }
	| { type: 'finalReceived'; text: string }
	| { type: 'partialReceived'; text: string }
	| { type: 'stopRequested' }
	| { type: 'finished'; text: string }
	| { type: 'cleanupRequested' }
	| { type: 'cleanupProgressed'; percent: number }
	| { type: 'cleaned'; isCleaned: boolean }
	| { type: 'cancelRequested' }
	| { type: 'resetRequested' }
	| { type: 'failed'; message: string };

/** Statuses a new dictation segment may start from. */
export const STARTABLE_STATUSES: ReadonlySet<DictationState['status']> =
	new Set(['idle', 'done', 'cancelled', 'error']);

/** Statuses the draft is editable in, and so may be cleaned on demand. */
export const CLEANABLE_STATUSES: ReadonlySet<DictationState['status']> =
	new Set(['idle', 'done', 'cancelled', 'error']);

export const INITIAL_DICTATION_STATE: DictationState = { status: 'idle' };

/**
 * `final` text is append-only and replaces the current partial, and `partial`
 * text replaces the previous partial, matching the server's transcript
 * contract. Cleaning always ends
 * in `done`, also from `finishing` when the finished event never arrived:
 * cancel and failure do not apply to it. An event that does not apply to the
 * current state is ignored, so late events never resurrect a dictation that
 * already ended. Cleaning starts at progress 0 and only moves forward: a
 * lower `cleanupProgressed` percent is ignored. The draft can be cleaned on
 * demand, hand edits included, from `idle`, `done`, `cancelled` and `error`:
 * `recleaning` ends in `done` through `cleaned`, and cancel and failure do not
 * apply to it. A cancelled dictation remembers
 * whether it had text, which the server keeps raw in the history. A reset
 * returns to the initial state from `idle`, `done`, `cancelled` and `error`,
 * and is ignored in every other status.
 */
export function dictationReducer(
	state: DictationState,
	event: DictationEvent
): DictationState {
	switch (event.type) {
		case 'startRequested':
			return STARTABLE_STATUSES.has(state.status)
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
				? {
						...state,
						committedText: state.committedText + event.text,
						partialText: '',
					}
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
				? { status: 'cleaning', rawText: event.text, progress: 0 }
				: state;
		case 'cleanupProgressed':
			return state.status === 'cleaning'
				? { ...state, progress: Math.max(state.progress, event.percent) }
				: state;
		case 'cleanupRequested':
			return CLEANABLE_STATUSES.has(state.status)
				? { status: 'recleaning' }
				: state;
		case 'cleaned':
			return state.status === 'cleaning' ||
				state.status === 'finishing' ||
				state.status === 'recleaning'
				? { status: 'done', isCleaned: event.isCleaned }
				: state;
		case 'cancelRequested':
			if (state.status === 'connecting') {
				return { status: 'cancelled', hasKeptText: false };
			}
			return isLive(state)
				? { status: 'cancelled', hasKeptText: hasText(state) }
				: state;
		case 'resetRequested':
			return STARTABLE_STATUSES.has(state.status)
				? INITIAL_DICTATION_STATE
				: state;
		case 'failed':
			return state.status === 'connecting' ||
				state.status === 'cleaning' ||
				isLive(state)
				? { status: 'error', message: event.message }
				: state;
	}
}

function isLive(
	state: DictationState
): state is Extract<DictationState, { status: 'recording' | 'finishing' }> {
	return state.status === 'recording' || state.status === 'finishing';
}

function hasText(
	state: Extract<DictationState, { status: 'recording' | 'finishing' }>
): boolean {
	return (state.committedText + state.partialText).trim() !== '';
}
