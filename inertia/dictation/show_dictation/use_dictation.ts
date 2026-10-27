import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { appendLevel } from './append_level';
import { describeDictationError } from './describe_dictation_error';
import { DICTATION_WORKLET_URL } from './dictation_worklet_url';
import { finalizeDictation } from './finalize_dictation';
import { LEVEL_HISTORY_CAPACITY } from './level_history_capacity';
import { DictationSession } from '~/dictation/core/dictation_session';
import {
	dictationReducer,
	INITIAL_DICTATION_STATE,
	STARTABLE_STATUSES,
	type DictationState,
} from '~/dictation/core/dictation_state';
import type { DictationTranscript } from '~/dictation/core/dictation_transcript';
import type { DraftContext } from '~/dictation/core/draft_context';
import { createSocketDictationTransport } from '~/dictation/core/socket_dictation_transport';

const EMPTY_TRANSCRIPT: DictationTranscript = {
	rawText: '',
	cleanedDraft: null,
};

type UseDictationOptions = {
	shouldAutoStart: boolean;
	insertSegment: (segment: string) => string;
	replaceDraft: (text: string) => string;
	getDraftContext: () => DraftContext;
	copyDraft: (text: string) => Promise<boolean>;
};

type UseDictationReturn = {
	state: DictationState;
	levels: readonly number[];
	finish: () => void;
	cancel: () => void;
	start: () => void;
};

/**
 * Drives one dictation segment at a time, dictated into the draft described by
 * `getDraftContext` and brought back into it when it ends, by `insertSegment`
 * or, when the server cleaned the whole draft, by `replaceDraft`, then copied
 * whole with `copyDraft`. Starts recording on mount only when `shouldAutoStart`
 * is true at that moment; later changes are ignored.
 */
export function useDictation({
	shouldAutoStart,
	insertSegment,
	replaceDraft,
	getDraftContext,
	copyDraft,
}: Readonly<UseDictationOptions>): UseDictationReturn {
	const { i18n } = useLingui();
	const [state, dispatch] = useReducer(
		dictationReducer,
		INITIAL_DICTATION_STATE
	);
	const [levels, setLevels] = useState<readonly number[]>([]);
	const sessionRef = useRef<DictationSession | null>(null);
	const shouldAutoStartOnMountRef = useRef(shouldAutoStart);
	const statusRef = useRef(state.status);
	useEffect(() => {
		statusRef.current = state.status;
	}, [state.status]);

	const fail = useCallback(
		(error: unknown) => {
			dispatch({
				type: 'failed',
				message: describeDictationError(error, i18n),
			});
		},
		[i18n]
	);

	const start = useCallback(async () => {
		if (!STARTABLE_STATUSES.has(statusRef.current)) return;
		dispatch({ type: 'startRequested' });
		setLevels([]);
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
			await session.start({ kind: 'draft', context: getDraftContext() });
			dispatch({ type: 'recordingStarted', startedAt: Date.now() });
		} catch (error) {
			fail(error);
		}
	}, [fail, getDraftContext]);

	const finish = useCallback(async () => {
		if (statusRef.current !== 'recording') return;
		dispatch({ type: 'stopRequested' });
		try {
			const transcript = (await sessionRef.current?.stop()) ?? EMPTY_TRANSCRIPT;
			const isCleaned = await finalizeDictation(
				transcript,
				{ insertSegment, replaceDraft },
				copyDraft
			);
			dispatch({ type: 'cleaned', isCleaned });
		} catch (error) {
			fail(error);
		}
	}, [fail, insertSegment, replaceDraft, copyDraft]);

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
		finish: () => void finish(),
		cancel,
		start: () => void start(),
	};
}
