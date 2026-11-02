import { describe, expect, it } from 'vitest';

import type { CleanupSnapshot } from '~/dictation/show_dictation/cleanup_snapshot';
import { getVersionToggle } from '~/dictation/show_dictation/get_version_toggle';

const SNAPSHOT: CleanupSnapshot = {
	draftId: 'draft-1',
	originalText: 'euh bonjour',
	cleanedText: 'Bonjour.',
	quality: 'standard',
};

describe('getVersionToggle', () => {
	it('should offer the original when the text is the cleaned text', () => {
		expect(getVersionToggle(SNAPSHOT, 'draft-1', 'Bonjour.')).toBe(
			'show-original'
		);
	});

	it('should offer the cleaned text when the text is the original', () => {
		expect(getVersionToggle(SNAPSHOT, 'draft-1', 'euh bonjour')).toBe(
			'show-cleaned'
		);
	});

	it('should offer nothing when the text is neither version', () => {
		expect(getVersionToggle(SNAPSHOT, 'draft-1', 'autre')).toBeNull();
	});

	it('should offer nothing when there is no snapshot', () => {
		expect(getVersionToggle(null, 'draft-1', 'Bonjour.')).toBeNull();
	});

	it('should offer nothing when the snapshot belongs to another draft', () => {
		expect(getVersionToggle(SNAPSHOT, 'draft-2', 'Bonjour.')).toBeNull();
	});

	it('should offer nothing when both versions are identical', () => {
		const identical = { ...SNAPSHOT, originalText: 'Bonjour.' };

		expect(getVersionToggle(identical, 'draft-1', 'Bonjour.')).toBeNull();
	});
});
