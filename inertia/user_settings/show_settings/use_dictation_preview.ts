import { useLingui } from '@lingui/react/macro';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { DictationSession } from '~/dictation/core/dictation_session';
import type { PreviewSettings } from '~/dictation/core/dictation_start_request';
import {
	dictationReducer,
	INITIAL_DICTATION_STATE,
	STARTABLE_STATUSES,
	type DictationState,
} from '~/dictation/core/dictation_state';
import { createSocketDictationTransport } from '~/dictation/core/socket_dictation_transport';
import { appendLevel } from '~/dictation/show_dictation/append_level';
import { describeDictationError } from '~/dictation/show_dictation/describe_dictation_error';
import { DICTATION_WORKLET_URL } from '~/dictation/show_dictation/dictation_worklet_url';
import { LEVEL_HISTORY_CAPACITY } from '~/dictation/show_dictation/level_history_capacity';

export type DictationPreviewResult = {
	rawText: string;
	cleanedText: string | null;
};

type UseDictationPreviewReturn = {
	state: DictationState;
	levels: readonly number[];
	result: DictationPreviewResult | null;
	start: () => void;
	finish: () => void;
	cancel: () => void;
};

/**
 * Drives one test dictation with the given form values. Nothing is written
 * back anywhere: the raw and cleaned texts only live in `result`, until the
 * next run.
 */
export function useDictationPreview(
	settings: Readonly<PreviewSettings>
): UseDictationPreviewReturn {
	const { i18n } = useLingui();
	const [state, dispatch] = useReducer(
		dictationReducer,
		INITIAL_DICTATION_STATE
	);
	const [levels, setLevels] = useState<readonly number[]>([]);
	const [result, setResult] = useState<DictationPreviewResult | null>(null);
	const sessionRef = useRef<DictationSession | null>(null);
	const statusRef = useRef(state.status);
	useEffect(() => {
		statusRef.current = state.status;
	}, [state.status]);

	const fail = useCallback(
		(error: unknown) =>
			dispatch({
				type: 'failed',
				message: describeDictationError(error, i18n),
			}),
		[i18n]
	);

	const start = useCallback(async () => {
		if (!STARTABLE_STATUSES.has(statusRef.current)) return;
		dispatch({ type: 'startRequested' });
		setLevels([]);
		setResult(null);
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
			await session.start({ kind: 'preview', settings });
			dispatch({ type: 'recordingStarted', startedAt: Date.now() });
		} catch (error) {
			fail(error);
		}
	}, [fail, settings]);

	const finish = useCallback(async () => {
		if (statusRef.current !== 'recording') return;
		dispatch({ type: 'stopRequested' });
		try {
			const transcript = await sessionRef.current?.stop();
			const cleanedText = transcript?.cleanedDraft ?? null;
			setResult({ rawText: transcript?.rawText ?? '', cleanedText });
			dispatch({ type: 'cleaned', isCleaned: cleanedText !== null });
		} catch (error) {
			fail(error);
		}
	}, [fail]);

	const cancel = useCallback(() => {
		dispatch({ type: 'cancelRequested' });
		void sessionRef.current?.cancel();
	}, []);

	useEffect(() => () => void sessionRef.current?.cancel(), []);

	return {
		state,
		levels,
		result,
		start: () => void start(),
		finish: () => void finish(),
		cancel,
	};
}
