/** Ctrl/Cmd+Enter runs the test from the text area, where plain Enter types a new line. */
export function isRunShortcut(
	event: Readonly<Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey'>>
): boolean {
	return event.key === 'Enter' && (event.ctrlKey || event.metaKey);
}
