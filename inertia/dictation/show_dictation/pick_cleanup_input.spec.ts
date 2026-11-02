import { describe, expect, it } from 'vitest';

import type { CleanupSnapshot } from '~/dictation/show_dictation/cleanup_snapshot';
import { pickCleanupInput } from '~/dictation/show_dictation/pick_cleanup_input';

const SNAPSHOT: CleanupSnapshot = {
	draftId: 'draft-1',
	originalText: 'euh bonjour',
	cleanedText: 'Bonjour.',
	quality: 'precise',
};

describe('pickCleanupInput', () => {
	it('should return the original text when the text is the cleaned text of the same draft', () => {
		expect(pickCleanupInput(SNAPSHOT, 'draft-1', 'Bonjour.')).toBe(
			'euh bonjour'
		);
	});

	it('should return the current text when it was edited since the re-clean', () => {
		expect(pickCleanupInput(SNAPSHOT, 'draft-1', 'Bonjour à tous.')).toBe(
			'Bonjour à tous.'
		);
	});

	it('should return the current text when the snapshot belongs to another draft', () => {
		expect(pickCleanupInput(SNAPSHOT, 'draft-2', 'Bonjour.')).toBe('Bonjour.');
	});

	it('should return the current text when there is no snapshot', () => {
		expect(pickCleanupInput(null, 'draft-1', 'Bonjour.')).toBe('Bonjour.');
	});
});
