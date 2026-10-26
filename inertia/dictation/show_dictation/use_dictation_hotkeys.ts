import { useEffect } from 'react';

import {
	STARTABLE_STATUSES,
	type DictationState,
} from '~/dictation/core/dictation_state';

type DictationHotkeyActions = {
	status: DictationState['status'];
	start: () => void;
	startNew: () => void;
	finish: () => void;
	cancel: () => void;
};

const NEW_DICTATION_KEY = 'n';
const NEW_DICTATION_STATUSES = new Set<DictationState['status']>([
	'done',
	'cancelled',
	'error',
]);
const LIVE_STATUSES = new Set<DictationState['status']>([
	'connecting',
	'recording',
	'finishing',
]);
const TEXT_FIELD_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const BUTTON_TAG = 'BUTTON';

const isTextFieldTarget = (target: EventTarget | null): boolean =>
	target instanceof HTMLElement &&
	(target.isContentEditable || TEXT_FIELD_TAGS.has(target.tagName));

const isButtonTarget = (target: EventTarget | null): boolean =>
	target instanceof HTMLElement && target.tagName === BUTTON_TAG;

const isModifiedEnter = (event: KeyboardEvent): boolean =>
	event.key === 'Enter' && (event.ctrlKey || event.metaKey);

/**
 * Enter toggles the dictation: it starts a new segment or finishes the running
 * one. Escape cancels a running segment, N clears the draft and starts over
 * once a dictation ended.
 * Keys typed in a text field keep their normal meaning. A focused button keeps
 * plain Enter, which activates it natively, but not N. Escape always cancels a
 * running dictation and Ctrl/Cmd+Enter toggles from anywhere.
 */
export function useDictationHotkeys({
	status,
	start,
	startNew,
	finish,
	cancel,
}: Readonly<DictationHotkeyActions>): void {
	useEffect(() => {
		const toggle = () => {
			if (STARTABLE_STATUSES.has(status)) return start();
			if (status === 'recording') finish();
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && LIVE_STATUSES.has(status)) return cancel();
			if (isModifiedEnter(event)) {
				event.preventDefault();
				return toggle();
			}
			if (isTextFieldTarget(event.target)) return;
			if (event.key === 'Enter') {
				return isButtonTarget(event.target) ? undefined : toggle();
			}
			if (
				event.key.toLowerCase() === NEW_DICTATION_KEY &&
				NEW_DICTATION_STATUSES.has(status)
			)
				startNew();
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [status, start, startNew, finish, cancel]);
}
