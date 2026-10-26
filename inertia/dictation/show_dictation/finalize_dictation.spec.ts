import { describe, expect, it, vi } from 'vitest';

import { finalizeDictation } from './finalize_dictation';

const RAW_TEXT = 'euh bonjour';
const CLEANED_TEXT = 'Bonjour.';

type CleanText = (text: string) => Promise<string>;
type CopyText = (text: string) => Promise<boolean>;

const createActions = (
	overrides: Partial<Parameters<typeof finalizeDictation>[1]> = {}
) => ({
	cleanText: vi.fn<CleanText>(async () => CLEANED_TEXT),
	copyText: vi.fn<CopyText>(async () => true),
	...overrides,
});

describe('finalizeDictation', () => {
	it('should clean the text then copy the cleaned text', async () => {
		const actions = createActions();

		const outcome = await finalizeDictation(RAW_TEXT, actions);

		expect(outcome).toEqual({
			text: CLEANED_TEXT,
			isCleaned: true,
			isCopied: true,
		});
		expect(actions.cleanText).toHaveBeenCalledWith(RAW_TEXT);
		expect(actions.copyText).toHaveBeenCalledWith(CLEANED_TEXT);
	});

	it('should skip both the cleanup and the copy when the text is empty', async () => {
		const actions = createActions();

		const outcome = await finalizeDictation('  ', actions);

		expect(outcome).toEqual({ text: '  ', isCleaned: true, isCopied: false });
		expect(actions.cleanText).not.toHaveBeenCalled();
		expect(actions.copyText).not.toHaveBeenCalled();
	});

	it('should fall back to the raw text and still copy it when the cleanup fails', async () => {
		const actions = createActions({
			cleanText: vi.fn<CleanText>(async () => {
				throw new Error('503');
			}),
		});

		const outcome = await finalizeDictation(RAW_TEXT, actions);

		expect(outcome).toEqual({
			text: RAW_TEXT,
			isCleaned: false,
			isCopied: true,
		});
		expect(actions.copyText).toHaveBeenCalledWith(RAW_TEXT);
	});

	it('should report the copy as failed when the clipboard refuses it', async () => {
		const actions = createActions({
			copyText: vi.fn<CopyText>(async () => false),
		});

		const outcome = await finalizeDictation(RAW_TEXT, actions);

		expect(outcome).toEqual({
			text: CLEANED_TEXT,
			isCleaned: true,
			isCopied: false,
		});
	});
});
