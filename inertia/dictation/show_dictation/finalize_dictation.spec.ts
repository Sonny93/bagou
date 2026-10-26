import { describe, expect, it, vi } from 'vitest';

import { finalizeDictation } from './finalize_dictation';

const RAW_TEXT = 'euh bonjour';
const CLEANED_TEXT = 'Bonjour.';
const DRAFT_PREFIX = 'Avant. ';

type CopyText = (text: string) => Promise<boolean>;

const createCopyText = (isCopied = true) =>
	vi.fn<CopyText>(async () => isCopied);

type InsertSegment = (segment: string) => string;

const createInsertSegment = () =>
	vi.fn<InsertSegment>((segment) => DRAFT_PREFIX + segment.trim());

describe('finalizeDictation', () => {
	it('should insert and copy the cleaned text when the server cleaned it', async () => {
		const insertSegment = createInsertSegment();
		const copyText = createCopyText();

		const outcome = await finalizeDictation(
			{ rawText: RAW_TEXT, cleanedText: CLEANED_TEXT },
			insertSegment,
			copyText
		);

		expect(outcome).toEqual({
			draftText: DRAFT_PREFIX + CLEANED_TEXT,
			isCleaned: true,
			isCopied: true,
		});
		expect(insertSegment).toHaveBeenCalledWith(CLEANED_TEXT);
		expect(copyText).toHaveBeenCalledWith(DRAFT_PREFIX + CLEANED_TEXT);
	});

	it('should fall back to the raw text and still copy the draft when the cleanup failed', async () => {
		const insertSegment = createInsertSegment();
		const copyText = createCopyText();

		const outcome = await finalizeDictation(
			{ rawText: RAW_TEXT, cleanedText: null },
			insertSegment,
			copyText
		);

		expect(outcome).toEqual({
			draftText: DRAFT_PREFIX + RAW_TEXT,
			isCleaned: false,
			isCopied: true,
		});
		expect(insertSegment).toHaveBeenCalledWith(RAW_TEXT);
		expect(copyText).toHaveBeenCalledWith(DRAFT_PREFIX + RAW_TEXT);
	});

	it('should not copy when the draft is blank', async () => {
		const copyText = createCopyText();

		const outcome = await finalizeDictation(
			{ rawText: '  ', cleanedText: '' },
			() => '',
			copyText
		);

		expect(outcome).toEqual({
			draftText: '',
			isCleaned: true,
			isCopied: false,
		});
		expect(copyText).not.toHaveBeenCalled();
	});

	it('should report the copy as failed when the clipboard refuses it', async () => {
		const outcome = await finalizeDictation(
			{ rawText: RAW_TEXT, cleanedText: CLEANED_TEXT },
			createInsertSegment(),
			createCopyText(false)
		);

		expect(outcome.isCopied).toBe(false);
	});
});
