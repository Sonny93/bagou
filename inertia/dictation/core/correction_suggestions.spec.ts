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
});
