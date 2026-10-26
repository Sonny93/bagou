import { describe, expect, it, vi } from 'vitest';

import { finalizeDictation } from './finalize_dictation';

const RAW_TEXT = 'euh bonjour';
const CLEANED_DRAFT = 'Avant. Bonjour.';
const DRAFT_PREFIX = 'Avant. ';

type CopyText = (text: string) => Promise<boolean>;

const createCopyText = (isCopied = true) =>
	vi.fn<CopyText>(async () => isCopied);

type DraftTextUpdate = (text: string) => string;

const createDraftEditor = (insertedDraft?: string) => ({
	insertSegment: vi.fn<DraftTextUpdate>(
		(segment) => insertedDraft ?? DRAFT_PREFIX + segment.trim()
	),
	replaceDraft: vi.fn<DraftTextUpdate>((text) => text),
});

describe('finalizeDictation', () => {
	it('should replace the whole draft with the cleaned draft and copy it', async () => {
		const draftEditor = createDraftEditor();
		const copyText = createCopyText();

		const outcome = await finalizeDictation(
			{ rawText: RAW_TEXT, cleanedDraft: CLEANED_DRAFT },
			draftEditor,
			copyText
		);

		expect(outcome).toEqual({
			draftText: CLEANED_DRAFT,
			isCleaned: true,
			isCopied: true,
		});
		expect(draftEditor.replaceDraft).toHaveBeenCalledWith(CLEANED_DRAFT);
		expect(draftEditor.insertSegment).not.toHaveBeenCalled();
		expect(copyText).toHaveBeenCalledWith(CLEANED_DRAFT);
	});

	it('should insert the raw segment and still copy the draft when the cleanup failed', async () => {
		const draftEditor = createDraftEditor();
		const copyText = createCopyText();

		const outcome = await finalizeDictation(
			{ rawText: RAW_TEXT, cleanedDraft: null },
			draftEditor,
			copyText
		);

		expect(outcome).toEqual({
			draftText: DRAFT_PREFIX + RAW_TEXT,
			isCleaned: false,
			isCopied: true,
		});
		expect(draftEditor.insertSegment).toHaveBeenCalledWith(RAW_TEXT);
		expect(draftEditor.replaceDraft).not.toHaveBeenCalled();
		expect(copyText).toHaveBeenCalledWith(DRAFT_PREFIX + RAW_TEXT);
	});

	it('should leave the draft unchanged and count it as cleaned when the segment is blank', async () => {
		const draftEditor = createDraftEditor('Brouillon.');

		const outcome = await finalizeDictation(
			{ rawText: '  ', cleanedDraft: null },
			draftEditor,
			createCopyText()
		);

		expect(outcome).toEqual({
			draftText: 'Brouillon.',
			isCleaned: true,
			isCopied: true,
		});
		expect(draftEditor.replaceDraft).not.toHaveBeenCalled();
	});

	it('should not copy when the draft is blank', async () => {
		const copyText = createCopyText();

		const outcome = await finalizeDictation(
			{ rawText: '  ', cleanedDraft: null },
			{ insertSegment: () => '', replaceDraft: (text) => text },
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
			{ rawText: RAW_TEXT, cleanedDraft: CLEANED_DRAFT },
			createDraftEditor(),
			createCopyText(false)
		);

		expect(outcome.isCopied).toBe(false);
	});
});
