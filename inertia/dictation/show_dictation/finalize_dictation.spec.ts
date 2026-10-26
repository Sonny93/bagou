import { describe, expect, it, vi } from 'vitest';

import { finalizeDictation } from './finalize_dictation';

const RAW_TEXT = 'euh bonjour';
const CLEANED_TEXT = 'Bonjour.';

type CopyText = (text: string) => Promise<boolean>;

const createCopyText = (isCopied = true) =>
	vi.fn<CopyText>(async () => isCopied);

describe('finalizeDictation', () => {
	it('should keep and copy the cleaned text when the server cleaned it', async () => {
		const copyText = createCopyText();

		const outcome = await finalizeDictation(
			{ rawText: RAW_TEXT, cleanedText: CLEANED_TEXT },
			copyText
		);

		expect(outcome).toEqual({
			text: CLEANED_TEXT,
			isCleaned: true,
			isCopied: true,
		});
		expect(copyText).toHaveBeenCalledWith(CLEANED_TEXT);
	});

	it('should fall back to the raw text and still copy it when the cleanup failed', async () => {
		const copyText = createCopyText();

		const outcome = await finalizeDictation(
			{ rawText: RAW_TEXT, cleanedText: null },
			copyText
		);

		expect(outcome).toEqual({
			text: RAW_TEXT,
			isCleaned: false,
			isCopied: true,
		});
		expect(copyText).toHaveBeenCalledWith(RAW_TEXT);
	});

	it('should not copy when the text is blank', async () => {
		const copyText = createCopyText();

		const outcome = await finalizeDictation(
			{ rawText: '  ', cleanedText: '' },
			copyText
		);

		expect(outcome).toEqual({ text: '', isCleaned: true, isCopied: false });
		expect(copyText).not.toHaveBeenCalled();
	});

	it('should report the copy as failed when the clipboard refuses it', async () => {
		const outcome = await finalizeDictation(
			{ rawText: RAW_TEXT, cleanedText: CLEANED_TEXT },
			createCopyText(false)
		);

		expect(outcome.isCopied).toBe(false);
	});
});
