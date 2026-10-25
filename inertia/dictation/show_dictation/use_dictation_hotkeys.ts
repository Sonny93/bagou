import { useEffect } from 'react';

import type { DictationState } from '~/dictation/core/dictation_state';

type DictationHotkeyActions = {
	status: DictationState['status'];
	finish: () => void;
	cancel: () => void;
	restart: () => void;
};

const RESTART_KEY = 'n';
const ENDED_STATUSES = new Set<DictationState['status']>([
	'done',
	'cancelled',
	'error',
]);
const LIVE_STATUSES = new Set<DictationState['status']>([
	'connecting',
	'recording',
	'finishing',
]);
const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']);

const isTypingTarget = (target: EventTarget | null): boolean =>
	target instanceof HTMLElement &&
	(target.isContentEditable || EDITABLE_TAGS.has(target.tagName));

/**
 * Enter finishes, Escape cancels, N starts a new dictation once one ended.
 * Keys typed in a field or on a button keep their normal meaning, except
 * Escape, which always cancels a running dictation.
 */
export function useDictationHotkeys({
	status,
	finish,
	cancel,
	restart,
}: Readonly<DictationHotkeyActions>): void {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && LIVE_STATUSES.has(status)) return cancel();
			if (isTypingTarget(event.target)) return;
			if (event.key === 'Enter') finish();
			if (event.key.toLowerCase() === RESTART_KEY && ENDED_STATUSES.has(status))
				restart();
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [status, finish, cancel, restart]);
}
