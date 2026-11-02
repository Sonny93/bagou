import { describe, expect, it } from 'vitest';

import { deriveSaveStatus } from '~/dictation/show_dictation/derive_save_status';

const DRAFT_ID = 'draft-1';

const buildInput = (
	overrides: Partial<Parameters<typeof deriveSaveStatus>[0]> = {}
): Parameters<typeof deriveSaveStatus>[0] => ({
	draftId: DRAFT_ID,
	text: 'Hello.',
	confirmed: null,
	isSaving: false,
	hasLastSaveFailed: false,
	...overrides,
});

describe('deriveSaveStatus', () => {
	it('should return none when the text is blank, whatever the rest', () => {
		const status = deriveSaveStatus(
			buildInput({ text: '  ', isSaving: true, hasLastSaveFailed: true })
		);

		expect(status).toBe('none');
	});

	it('should return saving when a save is in flight, even after a failure', () => {
		const status = deriveSaveStatus(
			buildInput({ isSaving: true, hasLastSaveFailed: true })
		);

		expect(status).toBe('saving');
	});

	it('should return failed when the last save failed and none is in flight', () => {
		const status = deriveSaveStatus(
			buildInput({
				hasLastSaveFailed: true,
				confirmed: { draftId: DRAFT_ID, text: 'Hello.', isStored: true },
			})
		);

		expect(status).toBe('failed');
	});

	it('should return saved when the text on screen was stored', () => {
		const status = deriveSaveStatus(
			buildInput({
				confirmed: { draftId: DRAFT_ID, text: 'Hello.', isStored: true },
			})
		);

		expect(status).toBe('saved');
	});

	it('should return not-in-history when the server had no entry for the text on screen', () => {
		const status = deriveSaveStatus(
			buildInput({
				confirmed: { draftId: DRAFT_ID, text: 'Hello.', isStored: false },
			})
		);

		expect(status).toBe('not-in-history');
	});

	it('should return pending when nothing was confirmed', () => {
		expect(deriveSaveStatus(buildInput())).toBe('pending');
	});

	it('should return pending when the confirmation is for an older text', () => {
		const status = deriveSaveStatus(
			buildInput({
				confirmed: { draftId: DRAFT_ID, text: 'Hell', isStored: true },
			})
		);

		expect(status).toBe('pending');
	});

	it('should return pending when the confirmation is for another draft', () => {
		const status = deriveSaveStatus(
			buildInput({
				confirmed: { draftId: 'draft-2', text: 'Hello.', isStored: true },
			})
		);

		expect(status).toBe('pending');
	});
});
