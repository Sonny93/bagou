import { describe, expect, it, vi } from 'vitest';

import { finalizeDictation } from './finalize_dictation';

const RAW_TEXT = 'euh bonjour';
const CLEANED_DRAFT = 'Avant. Bonjour.';
const DRAFT_PREFIX = 'Avant. ';

type CopyText = (text: string) => Promise<boolean>;

const createCopyText = () => vi.fn<CopyText>(async () => true);

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

		const isCleaned = await finalizeDictation(
			{ rawText: RAW_TEXT, cleanedDraft: CLEANED_DRAFT },
			draftEditor,
			copyText
		);

		expect(isCleaned).toBe(true);
		expect(draftEditor.replaceDraft).toHaveBeenCalledWith(CLEANED_DRAFT);
		expect(draftEditor.insertSegment).not.toHaveBeenCalled();
		expect(copyText).toHaveBeenCalledWith(CLEANED_DRAFT);
	});

	it('should insert the raw segment and still copy the draft when the cleanup failed', async () => {
		const draftEditor = createDraftEditor();
		const copyText = createCopyText();

		const isCleaned = await finalizeDictation(
			{ rawText: RAW_TEXT, cleanedDraft: null },
			draftEditor,
			copyText
		);

		expect(isCleaned).toBe(false);
		expect(draftEditor.insertSegment).toHaveBeenCalledWith(RAW_TEXT);
		expect(draftEditor.replaceDraft).not.toHaveBeenCalled();
		expect(copyText).toHaveBeenCalledWith(DRAFT_PREFIX + RAW_TEXT);
	});

	it('should leave the draft unchanged and count it as cleaned when the segment is blank', async () => {
		const draftEditor = createDraftEditor('Brouillon.');
		const copyText = createCopyText();

		const isCleaned = await finalizeDictation(
			{ rawText: '  ', cleanedDraft: null },
			draftEditor,
			copyText
		);

		expect(isCleaned).toBe(true);
		expect(draftEditor.replaceDraft).not.toHaveBeenCalled();
		expect(copyText).toHaveBeenCalledWith('Brouillon.');
	});

	it('should not copy when the draft is blank', async () => {
		const copyText = createCopyText();

		const isCleaned = await finalizeDictation(
			{ rawText: '  ', cleanedDraft: null },
			{ insertSegment: () => '', replaceDraft: (text) => text },
			copyText
		);

		expect(isCleaned).toBe(true);
		expect(copyText).not.toHaveBeenCalled();
	});
});
