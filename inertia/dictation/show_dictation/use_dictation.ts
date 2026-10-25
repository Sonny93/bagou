import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { describeDictationError } from './describe_dictation_error';
import { DICTATION_WORKLET_URL } from './dictation_worklet_url';
import { DictationSession } from '~/dictation/core/dictation_session';
import {
	dictationReducer,
	INITIAL_DICTATION_STATE,
	type DictationState,
} from '~/dictation/core/dictation_state';
import { createSocketDictationTransport } from '~/dictation/core/socket_dictation_transport';

const CAN_START_FROM = new Set<DictationState['status']>([
	'idle',
	'done',
	'cancelled',
	'error',
]);

type UseDictationReturn = {
	state: DictationState;
	level: number;
	finish: () => void;
	cancel: () => void;
	restart: () => void;
};

/** Starts recording on mount and drives one dictation at a time. */
export function useDictation(): UseDictationReturn {
	const [state, dispatch] = useReducer(
		dictationReducer,
		INITIAL_DICTATION_STATE
	);
	const [level, setLevel] = useState(0);
	const sessionRef = useRef<DictationSession | null>(null);
	const statusRef = useRef(state.status);
	useEffect(() => {
		statusRef.current = state.status;
	}, [state.status]);

	const fail = useCallback((error: unknown) => {
		dispatch({ type: 'failed', message: describeDictationError(error) });
	}, []);

	const restart = useCallback(async () => {
		if (!CAN_START_FROM.has(statusRef.current)) return;
		dispatch({ type: 'startRequested' });
		setLevel(0);
		const session = new DictationSession(
			{
				workletUrl: DICTATION_WORKLET_URL,
				createTransport: createSocketDictationTransport,
			},
			{
				onPartial: (text) => dispatch({ type: 'partialReceived', text }),
				onFinal: (text) => dispatch({ type: 'finalReceived', text }),
				onLevel: setLevel,
				onError: fail,
			}
		);
		sessionRef.current = session;
		try {
			await session.start();
			dispatch({ type: 'recordingStarted', startedAt: Date.now() });
		} catch (error) {
			fail(error);
		}
	}, [fail]);

	const finish = useCallback(async () => {
		if (statusRef.current !== 'recording') return;
		dispatch({ type: 'stopRequested' });
		try {
			const text = await sessionRef.current?.stop();
			dispatch({ type: 'finished', text: text ?? '' });
		} catch (error) {
			fail(error);
		}
	}, [fail]);

	const cancel = useCallback(() => {
		dispatch({ type: 'cancelRequested' });
		void sessionRef.current?.cancel();
	}, []);

	useEffect(() => {
		void restart();
		return () => void sessionRef.current?.cancel();
	}, [restart]);

	return {
		state,
		level,
		finish: () => void finish(),
		cancel,
		restart: () => void restart(),
	};
}
