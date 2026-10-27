import { describe, expect, it } from 'vitest';

import { isRunShortcut } from './is_run_shortcut';

describe('isRunShortcut', () => {
	it('should accept Enter with Ctrl or Cmd', () => {
		expect(isRunShortcut({ key: 'Enter', ctrlKey: true, metaKey: false })).toBe(
			true
		);
		expect(isRunShortcut({ key: 'Enter', ctrlKey: false, metaKey: true })).toBe(
			true
		);
	});

	it('should refuse a plain Enter, which types a new line', () => {
		expect(
			isRunShortcut({ key: 'Enter', ctrlKey: false, metaKey: false })
		).toBe(false);
	});

	it('should refuse another key with Ctrl', () => {
		expect(isRunShortcut({ key: 'a', ctrlKey: true, metaKey: false })).toBe(
			false
		);
	});
});
