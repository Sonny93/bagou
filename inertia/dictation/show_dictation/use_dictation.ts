import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { appendLevel } from './append_level';
import type { CopyStatus } from './copy_status';
import { describeDictationError } from './describe_dictation_error';
import { DICTATION_WORKLET_URL } from './dictation_worklet_url';
import { finalizeDictation } from './finalize_dictation';
import { LEVEL_HISTORY_CAPACITY } from './level_history_capacity';
import { DictationSession } from '~/dictation/core/dictation_session';
import {
	dictationReducer,
	INITIAL_DICTATION_STATE,
	type DictationState,
} from '~/dictation/core/dictation_state';
import type { DictationTranscript } from '~/dictation/core/dictation_transcript';
import { createSocketDictationTransport } from '~/dictation/core/socket_dictation_transport';
import { copyToClipboard } from '~/shared/lib/copy_to_clipboard';

const toCopyStatus = (text: string, isCopied: boolean): CopyStatus => {
	if (isCopied) return 'copied';
	return text.trim() === '' ? 'none' : 'failed';
};

const EMPTY_TRANSCRIPT: DictationTranscript = {
	rawText: '',
	cleanedText: '',
};

const CAN_START_FROM = new Set<DictationState['status']>([
	'idle',
	'done',
	'cancelled',
	'error',
]);

type UseDictationOptions = {
	shouldAutoStart: boolean;
};

type UseDictationReturn = {
	state: DictationState;
	levels: readonly number[];
	copyStatus: CopyStatus;
	copyText: (text: string) => void;
	finish: () => void;
	cancel: () => void;
	start: () => void;
};

/**
 * Drives one dictation at a time. Starts recording on mount only when
 * `shouldAutoStart` is true at that moment; later changes are ignored.
 */
export function useDictation({
	shouldAutoStart,
}: Readonly<UseDictationOptions>): UseDictationReturn {
	const [state, dispatch] = useReducer(
		dictationReducer,
		INITIAL_DICTATION_STATE
	);
	const [levels, setLevels] = useState<readonly number[]>([]);
	const [copyStatus, setCopyStatus] = useState<CopyStatus>('none');
	const sessionRef = useRef<DictationSession | null>(null);
	const shouldAutoStartOnMountRef = useRef(shouldAutoStart);
	const statusRef = useRef(state.status);
	useEffect(() => {
		statusRef.current = state.status;
	}, [state.status]);

	const fail = useCallback((error: unknown) => {
		dispatch({ type: 'failed', message: describeDictationError(error) });
	}, []);

	const start = useCallback(async () => {
		if (!CAN_START_FROM.has(statusRef.current)) return;
		dispatch({ type: 'startRequested' });
		setLevels([]);
		setCopyStatus('none');
		const session = new DictationSession(
			{
				workletUrl: DICTATION_WORKLET_URL,
				createTransport: createSocketDictationTransport,
			},
			{
				onPartial: (text) => dispatch({ type: 'partialReceived', text }),
				onFinal: (text) => dispatch({ type: 'finalReceived', text }),
				onFinished: (text) => dispatch({ type: 'finished', text }),
				onLevel: (level) =>
					setLevels((previous) =>
						appendLevel(previous, level, LEVEL_HISTORY_CAPACITY)
					),
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
			const transcript = (await sessionRef.current?.stop()) ?? EMPTY_TRANSCRIPT;
			const { text, isCleaned, isCopied } = await finalizeDictation(
				transcript,
				copyToClipboard
			);
			setCopyStatus(toCopyStatus(text, isCopied));
			dispatch({ type: 'cleaned', text, isCleaned });
		} catch (error) {
			fail(error);
		}
	}, [fail]);

	const copyText = useCallback(async (text: string) => {
		const isCopied = await copyToClipboard(text);
		setCopyStatus(toCopyStatus(text, isCopied));
	}, []);

	const cancel = useCallback(() => {
		dispatch({ type: 'cancelRequested' });
		void sessionRef.current?.cancel();
	}, []);

	useEffect(() => {
		if (shouldAutoStartOnMountRef.current) void start();
		return () => void sessionRef.current?.cancel();
	}, [start]);

	return {
		state,
		levels,
		copyStatus,
		copyText: (text) => void copyText(text),
		finish: () => void finish(),
		cancel,
		start: () => void start(),
	};
}
