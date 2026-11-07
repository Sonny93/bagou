import { describe, expect, it } from 'vitest';

import type { CorrectionPair } from './correction_pair';
import {
	correctionSuggestionsReducer,
	createCorrectionSuggestions,
	type CorrectionSuggestions,
} from './correction_suggestions';

const VOXTRAL: CorrectionPair = { heard: 'vox trale', written: 'Voxtral' };
const ADONIS: CorrectionPair = { heard: 'a donis', written: 'Adonis' };
const SPOKEN_VOXTRAL = 'I use vox trale today';
const WRITTEN_VOXTRAL = 'I use Voxtral today';
const SPOKEN_BOTH = 'I use vox trale and a donis today';
const WRITTEN_BOTH = 'I use Voxtral and Adonis today';

const buildState = (
	overrides: Partial<CorrectionSuggestions> = {}
): CorrectionSuggestions => ({
	...createCorrectionSuggestions([]),
	baseline: SPOKEN_VOXTRAL,
	...overrides,
});

describe('correctionSuggestionsReducer', () => {
	it('should queue the correction made by hand since the baseline', () => {
		const state = correctionSuggestionsReducer(buildState(), {
			type: 'edited',
			currentText: WRITTEN_VOXTRAL,
		});

		expect(state.queue).toEqual([VOXTRAL]);
	});

	it('should return the same state when nothing was corrected', () => {
		const state = buildState();

		expect(
			correctionSuggestionsReducer(state, {
				type: 'edited',
				currentText: SPOKEN_VOXTRAL,
			})
		).toBe(state);
	});

	it('should offer only the final pair after a half-typed word is completed', () => {
		const half = correctionSuggestionsReducer(buildState(), {
			type: 'edited',
			currentText: 'I use Voxtra today',
		});
		expect(half.queue).toEqual([{ heard: 'vox trale', written: 'Voxtra' }]);

		const state = correctionSuggestionsReducer(half, {
			type: 'edited',
			currentText: WRITTEN_VOXTRAL,
		});

		expect(state.queue).toEqual([VOXTRAL]);
	});

	it('should drop the candidate of an edit the user reverts', () => {
		const edited = correctionSuggestionsReducer(buildState(), {
			type: 'edited',
			currentText: WRITTEN_VOXTRAL,
		});

		const state = correctionSuggestionsReducer(edited, {
			type: 'edited',
			currentText: SPOKEN_VOXTRAL,
		});

		expect(state.queue).toEqual([]);
	});

	it('should keep a flushed candidate through later edits', () => {
		const flushed = correctionSuggestionsReducer(buildState(), {
			type: 'rebased',
			currentText: WRITTEN_VOXTRAL,
			baseline: SPOKEN_BOTH,
		});

		const state = correctionSuggestionsReducer(flushed, {
			type: 'edited',
			currentText: WRITTEN_BOTH,
		});

		expect(state.queue).toEqual([VOXTRAL, ADONIS]);
	});

	it('should return the same state when the live candidates did not change', () => {
		const edited = correctionSuggestionsReducer(buildState(), {
			type: 'edited',
			currentText: WRITTEN_VOXTRAL,
		});

		expect(
			correctionSuggestionsReducer(edited, {
				type: 'edited',
				currentText: WRITTEN_VOXTRAL,
			})
		).toBe(edited);
	});

	it('should queue a candidate once however often the edit is detected', () => {
		const edited = {
			type: 'edited',
			currentText: WRITTEN_VOXTRAL,
		} as const;
		const once = correctionSuggestionsReducer(buildState(), edited);

		expect(correctionSuggestionsReducer(once, edited).queue).toEqual([VOXTRAL]);
	});

	it('should not queue a known pair', () => {
		const state = correctionSuggestionsReducer(
			buildState({ knownPairs: [{ heard: 'Vox Trale', written: 'voxtral' }] }),
			{ type: 'edited', currentText: WRITTEN_VOXTRAL }
		);

		expect(state.queue).toEqual([]);
	});

	it('should flush the hand edits into the queue before moving the baseline', () => {
		const state = correctionSuggestionsReducer(buildState(), {
			type: 'rebased',
			currentText: WRITTEN_VOXTRAL,
			baseline: 'A freshly cleaned text',
		});

		expect(state).toMatchObject({
			baseline: 'A freshly cleaned text',
			queue: [VOXTRAL],
		});
	});

	it('should keep the queue when the baseline moves again', () => {
		const queued = buildState({ flushed: [VOXTRAL], queue: [VOXTRAL] });

		const state = correctionSuggestionsReducer(queued, {
			type: 'rebased',
			currentText: SPOKEN_VOXTRAL,
			baseline: '',
		});

		expect(state.queue).toEqual([VOXTRAL]);
	});

	it('should measure later edits against the new baseline', () => {
		const rebased = correctionSuggestionsReducer(buildState(), {
			type: 'rebased',
			currentText: SPOKEN_VOXTRAL,
			baseline: SPOKEN_BOTH,
		});

		const state = correctionSuggestionsReducer(rebased, {
			type: 'edited',
			currentText: WRITTEN_BOTH,
		});

		expect(state.queue).toEqual([VOXTRAL, ADONIS]);
	});

	it('should move a resolved pair from the queue to the known pairs', () => {
		const state = correctionSuggestionsReducer(
			buildState({
				flushed: [VOXTRAL],
				live: [ADONIS],
				queue: [VOXTRAL, ADONIS],
			}),
			{ type: 'resolved', pair: { heard: 'VOX TRALE', written: 'voxtral' } }
		);

		expect(state).toMatchObject({
			flushed: [],
			live: [ADONIS],
			queue: [ADONIS],
			knownPairs: [{ heard: 'VOX TRALE', written: 'voxtral' }],
		});
	});

	it('should remove a resolved pair from the live candidates too', () => {
		const edited = correctionSuggestionsReducer(buildState(), {
			type: 'edited',
			currentText: WRITTEN_VOXTRAL,
		});

		const state = correctionSuggestionsReducer(edited, {
			type: 'resolved',
			pair: VOXTRAL,
		});

		expect(state).toMatchObject({ live: [], queue: [] });
	});

	it('should not suggest a resolved pair again', () => {
		const resolved = correctionSuggestionsReducer(buildState(), {
			type: 'resolved',
			pair: VOXTRAL,
		});

		const state = correctionSuggestionsReducer(resolved, {
			type: 'edited',
			currentText: WRITTEN_VOXTRAL,
		});

		expect(state.queue).toEqual([]);
	});

	describe('when the user keeps typing after a fix', () => {
		const MORE_WORDS = Array.from(
			{ length: 30 },
			(_, index) => `w${index}`
		).join(' ');

		const edit = (
			state: CorrectionSuggestions,
			currentText: string
		): CorrectionSuggestions =>
			correctionSuggestionsReducer(state, { type: 'edited', currentText });

		it('should keep a pair after 30 more words typed after the fix', () => {
			const fixed = edit(buildState(), WRITTEN_VOXTRAL);

			const state = edit(fixed, `${WRITTEN_VOXTRAL} ${MORE_WORDS}`);

			expect(state.queue).toEqual([VOXTRAL]);
		});

		it('should keep a pair when the user edits the word right next to it', () => {
			const fixed = edit(buildState(), WRITTEN_VOXTRAL);

			const state = edit(fixed, 'I employ Voxtral today');

			expect(state.queue).toContainEqual(VOXTRAL);
		});

		it('should drop a kept pair when the fix is reverted', () => {
			const fixed = edit(buildState(), WRITTEN_VOXTRAL);
			const typed = edit(fixed, `${WRITTEN_VOXTRAL} ${MORE_WORDS}`);

			const state = edit(typed, `${SPOKEN_VOXTRAL} ${MORE_WORDS}`);

			expect(state.queue).toEqual([]);
		});

		it('should drop a kept pair when the written word is deleted', () => {
			const fixed = edit(buildState(), WRITTEN_VOXTRAL);
			const typed = edit(fixed, `${WRITTEN_VOXTRAL} ${MORE_WORDS}`);

			const state = edit(typed, `I use today ${MORE_WORDS}`);

			expect(state.queue).toEqual([]);
		});

		it('should not keep their to there alive through therefore or a baseline there', () => {
			const pair: CorrectionPair = { heard: 'their', written: 'there' };
			const baseline = 'there is their car';
			const kept = buildState({ baseline, live: [pair], queue: [pair] });

			const state = edit(kept, 'there is therefore their car');

			expect(state.queue).toEqual([]);
		});
	});
});
