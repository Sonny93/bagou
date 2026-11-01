import { describe, expect, it } from 'vitest';

import { deriveCopyStatus } from './derive_copy_status';

describe('deriveCopyStatus', () => {
	it('should be none when nothing was copied for the draft', () => {
		expect(
			deriveCopyStatus({
				draftText: 'Bonjour',
				copiedText: null,
				draftTextAtCopy: null,
				hasLastCopyFailed: false,
			})
		).toBe('none');
	});

	it('should be none when the draft is blank', () => {
		expect(
			deriveCopyStatus({
				draftText: '  ',
				copiedText: '  ',
				draftTextAtCopy: '  ',
				hasLastCopyFailed: true,
			})
		).toBe('none');
	});

	it('should be copied when the copied text equals the whole draft', () => {
		expect(
			deriveCopyStatus({
				draftText: 'Bonjour',
				copiedText: 'Bonjour',
				draftTextAtCopy: 'Bonjour',
				hasLastCopyFailed: false,
			})
		).toBe('copied');
	});

	it('should be stale when the whole draft was copied then edited', () => {
		expect(
			deriveCopyStatus({
				draftText: 'Bonjour à tous',
				copiedText: 'Bonjour',
				draftTextAtCopy: 'Bonjour',
				hasLastCopyFailed: false,
			})
		).toBe('stale');
	});

	it('should be selection-copied when a part was copied and the draft is unchanged', () => {
		expect(
			deriveCopyStatus({
				draftText: 'Bonjour à tous',
				copiedText: 'Bonjour',
				draftTextAtCopy: 'Bonjour à tous',
				hasLastCopyFailed: false,
			})
		).toBe('selection-copied');
	});

	it('should be none when a part was copied and the draft was edited since', () => {
		expect(
			deriveCopyStatus({
				draftText: 'Bonjour à tous les amis',
				copiedText: 'Bonjour',
				draftTextAtCopy: 'Bonjour à tous',
				hasLastCopyFailed: false,
			})
		).toBe('none');
	});

	it('should be failed when the last copy attempt failed', () => {
		expect(
			deriveCopyStatus({
				draftText: 'Bonjour',
				copiedText: 'Bonjour',
				draftTextAtCopy: 'Bonjour',
				hasLastCopyFailed: true,
			})
		).toBe('failed');
	});
});
