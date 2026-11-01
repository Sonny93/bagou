import { describe, expect, it } from 'vitest';

import type { CopyAttempt } from './copy_attempt';
import { recordCopyAttempt } from './record_copy_attempt';

const buildAttempt = (overrides: Partial<CopyAttempt> = {}): CopyAttempt => ({
	draftId: 'draft-1',
	copiedText: 'Bonjour',
	draftTextAtCopy: 'Bonjour',
	hasLastCopyFailed: false,
	copyCount: 1,
	...overrides,
});

describe('recordCopyAttempt', () => {
	it('should increment the copy count when a copy succeeds for the same draft', () => {
		const attempt = recordCopyAttempt({
			previous: buildAttempt({ copyCount: 2 }),
			draftId: 'draft-1',
			text: 'Bonjour',
			draftText: 'Bonjour',
			isCopied: true,
		});

		expect(attempt.copyCount).toBe(3);
		expect(attempt.copiedText).toBe('Bonjour');
		expect(attempt.hasLastCopyFailed).toBe(false);
	});

	it('should keep the copy count when a copy fails for the same draft', () => {
		const attempt = recordCopyAttempt({
			previous: buildAttempt({ copyCount: 2 }),
			draftId: 'draft-1',
			text: 'Bonjour',
			draftText: 'Bonjour',
			isCopied: false,
		});

		expect(attempt.copyCount).toBe(2);
		expect(attempt.hasLastCopyFailed).toBe(true);
	});

	it('should start the copy count at 1 when a copy succeeds for a new draft', () => {
		const attempt = recordCopyAttempt({
			previous: buildAttempt({ copyCount: 4 }),
			draftId: 'draft-2',
			text: 'Salut',
			draftText: 'Salut',
			isCopied: true,
		});

		expect(attempt.copyCount).toBe(1);
	});

	it('should start the copy count at 0 when a copy fails for a new draft', () => {
		const attempt = recordCopyAttempt({
			previous: buildAttempt({ copyCount: 4 }),
			draftId: 'draft-2',
			text: 'Salut',
			draftText: 'Salut',
			isCopied: false,
		});

		expect(attempt.copyCount).toBe(0);
	});

	it('should keep the copied text when a copy fails for the same draft', () => {
		const attempt = recordCopyAttempt({
			previous: buildAttempt({ copiedText: 'Bonjour' }),
			draftId: 'draft-1',
			text: 'Bonjour à tous',
			draftText: 'Bonjour à tous',
			isCopied: false,
		});

		expect(attempt.copiedText).toBe('Bonjour');
	});

	it('should drop the copied text when a copy fails for a new draft', () => {
		const attempt = recordCopyAttempt({
			previous: buildAttempt({ copiedText: 'Bonjour' }),
			draftId: 'draft-2',
			text: 'Salut',
			draftText: 'Salut',
			isCopied: false,
		});

		expect(attempt.copiedText).toBeNull();
	});

	it('should record the draft text at copy time when a copy succeeds', () => {
		const attempt = recordCopyAttempt({
			previous: null,
			draftId: 'draft-1',
			text: 'Bonjour',
			draftText: 'Bonjour à tous',
			isCopied: true,
		});

		expect(attempt.copiedText).toBe('Bonjour');
		expect(attempt.draftTextAtCopy).toBe('Bonjour à tous');
	});

	it('should keep the draft text at copy time when a copy fails for the same draft', () => {
		const attempt = recordCopyAttempt({
			previous: buildAttempt({ draftTextAtCopy: 'Bonjour à tous' }),
			draftId: 'draft-1',
			text: 'Salut',
			draftText: 'Salut',
			isCopied: false,
		});

		expect(attempt.draftTextAtCopy).toBe('Bonjour à tous');
	});
});
