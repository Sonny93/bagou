import { describe, expect, it } from 'vitest';

import { deriveCopyStatus } from './derive_copy_status';

describe('deriveCopyStatus', () => {
	it('should be none when nothing was copied for the draft', () => {
		expect(
			deriveCopyStatus({
				draftText: 'Bonjour',
				lastCopiedText: null,
				hasLastCopyFailed: false,
			})
		).toBe('none');
	});

	it('should be none when the draft is blank', () => {
		expect(
			deriveCopyStatus({
				draftText: '  ',
				lastCopiedText: '  ',
				hasLastCopyFailed: true,
			})
		).toBe('none');
	});

	it('should be copied when the draft equals the last copied text', () => {
		expect(
			deriveCopyStatus({
				draftText: 'Bonjour',
				lastCopiedText: 'Bonjour',
				hasLastCopyFailed: false,
			})
		).toBe('copied');
	});

	it('should be stale when the draft changed since the last copy', () => {
		expect(
			deriveCopyStatus({
				draftText: 'Bonjour à tous',
				lastCopiedText: 'Bonjour',
				hasLastCopyFailed: false,
			})
		).toBe('stale');
	});

	it('should be failed when the last copy attempt failed', () => {
		expect(
			deriveCopyStatus({
				draftText: 'Bonjour',
				lastCopiedText: 'Bonjour',
				hasLastCopyFailed: true,
			})
		).toBe('failed');
	});
});
