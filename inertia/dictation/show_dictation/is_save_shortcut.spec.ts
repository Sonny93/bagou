import { describe, expect, it } from 'vitest';

import { isSaveShortcut } from '~/dictation/show_dictation/is_save_shortcut';

const buildEvent = (
	overrides: Partial<Parameters<typeof isSaveShortcut>[0]>
) => ({
	key: 's',
	ctrlKey: false,
	metaKey: false,
	shiftKey: false,
	altKey: false,
	...overrides,
});

describe('isSaveShortcut', () => {
	it('should match when Ctrl+S is pressed', () => {
		expect(isSaveShortcut(buildEvent({ ctrlKey: true }))).toBe(true);
	});

	it('should match when Cmd+S is pressed', () => {
		expect(isSaveShortcut(buildEvent({ metaKey: true }))).toBe(true);
	});

	it('should match when the key is an upper case S', () => {
		expect(isSaveShortcut(buildEvent({ key: 'S', ctrlKey: true }))).toBe(true);
	});

	it('should not match when S is pressed without Ctrl or Cmd', () => {
		expect(isSaveShortcut(buildEvent({}))).toBe(false);
	});

	it('should not match when Shift is held', () => {
		expect(isSaveShortcut(buildEvent({ ctrlKey: true, shiftKey: true }))).toBe(
			false
		);
	});

	it('should not match when Alt is held', () => {
		expect(isSaveShortcut(buildEvent({ ctrlKey: true, altKey: true }))).toBe(
			false
		);
	});

	it('should not match when another key is pressed with Ctrl', () => {
		expect(isSaveShortcut(buildEvent({ key: 'c', ctrlKey: true }))).toBe(false);
	});
});
