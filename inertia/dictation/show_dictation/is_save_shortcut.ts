const SAVE_KEY = 's';

type SaveShortcutEvent = Pick<
	KeyboardEvent,
	'key' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'
>;

/** Ctrl+S or Cmd+S, without Shift or Alt, whatever the letter case. */
export const isSaveShortcut = (event: Readonly<SaveShortcutEvent>): boolean =>
	event.key.toLowerCase() === SAVE_KEY &&
	(event.ctrlKey || event.metaKey) &&
	!event.shiftKey &&
	!event.altKey;
